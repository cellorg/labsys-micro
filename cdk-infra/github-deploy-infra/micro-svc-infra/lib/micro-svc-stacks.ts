import * as cdkUtil from '../../common/cdkUtil'
import * as cdk from 'aws-cdk-lib';
import {aws_ec2, aws_ecs, aws_logs, Duration, aws_iam} from 'aws-cdk-lib';
import {DnsRecordType, PrivateDnsNamespace} from 'aws-cdk-lib/aws-servicediscovery';
import * as apigatewayv2_integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import {HttpMethod, HttpRoute, HttpRouteKey, HttpRouteProps} from '@aws-cdk/aws-apigatewayv2-alpha';
import {RetentionDays} from 'aws-cdk-lib/aws-logs';
import { LabsysSecrets } from './shared-secrets-stack';

export interface ServiceInfraStackProps extends cdk.StackProps {
  vpcLink: apigatewayv2.VpcLink,
  dnsNamespace: PrivateDnsNamespace,
  securityGroup: aws_ec2.SecurityGroup,
  ecsTaskRole: aws_iam.Role,
  sharedSecrets: LabsysSecrets
}

export class MicroSvcStack extends cdk.Stack {

  constructor(scope: cdk.App, id: string, props: ServiceInfraStackProps, microSvcName: string) {
    super(scope, id, props);

    const vpc = aws_ec2.Vpc.fromLookup(this, cdkUtil.vpcId, { vpcName: cdkUtil.vpcId });

    const vpcLink = props.vpcLink;
    const dnsNamespace = props.dnsNamespace;
    const securityGroup = props.securityGroup;
    const ecsTaskRole = props.ecsTaskRole;
    const sharedSecrets = props.sharedSecrets;

    const microSvcNameResourcePrefix = cdkUtil.applicationName + '-' + microSvcName;
    const apiGateway = apigatewayv2.HttpApi.fromHttpApiAttributes(this, cdkUtil.exportedApiGatewayId, {
      httpApiId: cdk.Fn.importValue(cdkUtil.exportedApiGatewayId)
    }) as apigatewayv2.HttpApi;

    const pdpOwnerPassword = props.sharedSecrets.PDP_OWNER_PASSWORD;
    pdpOwnerPassword.grantRead(ecsTaskRole);

    const clusterId = microSvcNameResourcePrefix + '-ecsCluster';
    const cluster = new aws_ecs.Cluster(this, clusterId, {
      clusterName: clusterId,
      vpc: vpc,
    });
    cdkUtil.tagItem(cluster, clusterId);

    const taskDefinitionId = microSvcNameResourcePrefix + '-taskDefinition';
    //@ts-ignore
    const taskDefinition = new aws_ecs.FargateTaskDefinition(this, taskDefinitionId, {
      cpu: 256,
      memoryLimitMiB: 512,
      taskRole: ecsTaskRole,
    });
    cdkUtil.tagItem(taskDefinition, taskDefinitionId);

    // Note: keep the logGroupName unique
    // If we want to keep the log after destroy, then it needs to be unique.
    // Otherwise, re-deploy will fail with "already exist" error
    const logGroupName = '/ecs/' + microSvcName + "/" + cdkUtil.timeStampStr();
    const svcLogGroup = new aws_logs.LogGroup(
        this,
        microSvcName + '-ServiceLogGroup',
        {
          logGroupName: logGroupName,
          retention: cdkUtil.awsSvcLogRetentionDays as RetentionDays,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }
    );
    const svcLogDriver = new aws_ecs.AwsLogDriver({
      logGroup: svcLogGroup,
      streamPrefix: microSvcName,
    });
    const containerId = microSvcNameResourcePrefix + '-container';
    const container = taskDefinition.addContainer(
        containerId,
        {
          containerName: containerId,
          // In the future, we may be able to set the specific ECR repo for the images once the cdk open issue is completed.
          // cdk open issue: https://github.com/aws/aws-cdk/issues/12597
          image: aws_ecs.ContainerImage.fromAsset('../../../microservices/' + microSvcName),
          environment: {
            PDP_OWNER_USERNAME: cdkUtil.PDP_OWNER_USERNAME,
            PDP_OWNER_JDBC_URL: cdkUtil.PDP_OWNER_JDBC_URL,
          },
          secrets: {
            PDP_OWNER_PASSWORD: aws_ecs.Secret.fromSecretsManager(sharedSecrets.PDP_OWNER_PASSWORD),
          },
          logging: svcLogDriver,
          portMappings: [{ containerPort: 8080 }],
        }
    );
    cdkUtil.tagItem(container, containerId);

    const fargateServiceId = microSvcNameResourcePrefix + '-fargateService';
    //@ts-ignore
    const fargateService = new aws_ecs.FargateService(this, fargateServiceId, {
      cluster: cluster,
      securityGroups: [securityGroup],
      taskDefinition: taskDefinition,
      circuitBreaker: {
        rollback: true,
      },
      assignPublicIp: false,
      desiredCount: cdkUtil.fargateSvcDesiredCount,
      cloudMapOptions: {
        name: microSvcNameResourcePrefix,
        cloudMapNamespace: dnsNamespace,
        dnsRecordType: DnsRecordType.SRV,
      },
    });
    cdkUtil.tagItem(fargateService, fargateServiceId);

    const scaling = fargateService.autoScaleTaskCount({
      maxCapacity: 6,
      minCapacity: cdkUtil.fargateSvcDesiredCount
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60)
    });

    // Open issues: https://github.com/aws/aws-cdk/issues/12337
    // const apiGatewayId = cdkUtil.applicationName + '-apiGateway';
    // apiGateway.addRoutes({
    //   integration: new apigatewayv2_integrations.HttpServiceDiscoveryIntegration(
    //       microSvcName + '-ServiceDiscoveryIntegration',
    //       this.cloudMapSvc,
    //       {
    //         vpcLink: vpcLink,
    //       },
    //   ),
    //   path: '/' + microSvcName + '/{proxy+}',
    //   methods: [HttpMethod.ANY],
    // });
    // cdkUtil.tagItem(apiGateway, apiGatewayId);
    // NOTE: following is the workaround for now 2022-10-07
    try {
      const integration = new apigatewayv2_integrations.HttpServiceDiscoveryIntegration(
          microSvcName + '-ServiceDiscoveryIntegration',
          //@ts-ignore
          fargateService.cloudMapService,
          {
            vpcLink: vpcLink,
          },
      );

      const httpRouteKey = HttpRouteKey.with(
          '/' + microSvcName + '/{proxy+}',
          HttpMethod.ANY
      );

      const httpRouteProps: HttpRouteProps = {
        httpApi: apiGateway,
        integration: integration,
        routeKey: httpRouteKey
      };

      new HttpRoute(this, id, httpRouteProps);
    } catch (e) {
      console.log(e);
    }
  }
}

