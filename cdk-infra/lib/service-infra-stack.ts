import * as cdkUtil from './cdkUtil'
import * as cdk from 'aws-cdk-lib';
import { aws_ec2, aws_ecs, aws_ecr } from "aws-cdk-lib";
import {Vpc} from "aws-cdk-lib/aws-ec2";
import {DnsRecordType, PrivateDnsNamespace} from "aws-cdk-lib/aws-servicediscovery";
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigatewayv2_integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {HttpMethod} from "@aws-cdk/aws-apigatewayv2-alpha";

export interface ServiceInfraStackProps extends cdk.StackProps {
  vpc: Vpc,
  vpcLink: apigatewayv2.VpcLink,
  dnsNamespace: PrivateDnsNamespace,
  apiGateway: apigatewayv2.HttpApi
}

export class ServiceInfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ServiceInfraStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;
    const vpcLink = props.vpcLink;
    const dnsNamespace = props.dnsNamespace;
    const apiGateway = props.apiGateway;

    const clusterId = cdkUtil.microSvcNameResourcePrefix + '-ecsCluster';
    const cluster = new aws_ecs.Cluster(this, clusterId, {
      clusterName: clusterId,
      vpc: vpc,
    });
    cdkUtil.tagItem(cluster, clusterId);

    const taskDefinitionId = cdkUtil.microSvcNameResourcePrefix + '-taskDefinition'
    const taskDefinition = new aws_ecs.FargateTaskDefinition(this, taskDefinitionId, {
      cpu: 256,
      memoryLimitMiB: 512,
    });
    cdkUtil.tagItem(taskDefinition, taskDefinitionId);

    const imageRepo = aws_ecr.Repository.fromRepositoryName(this, cdkUtil.imageRepoId, cdkUtil.imageRepoId);

    const containerId = cdkUtil.microSvcNameResourcePrefix + '-container';
    const container = taskDefinition.addContainer(
        containerId,
        {
          containerName: containerId,
          image: aws_ecs.ContainerImage.fromEcrRepository(imageRepo, cdkUtil.imageTag),
          environment: {
            PDP_OWNER_JDBC_URL: cdkUtil.PDP_OWNER_JDBC_URL,
          }
          //logging: ,
        }
    );
    container.addPortMappings({ containerPort: 8080 });
    cdkUtil.tagItem(container, containerId);

    const securityGroupId = cdkUtil.microSvcNameResourcePrefix + '-securityGroup';
    const securityGroup = new aws_ec2.SecurityGroup(this, securityGroupId, {
      securityGroupName: securityGroupId,
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Allow traffic to Fargate HTTP API service.',
    });
    securityGroup.connections.allowFromAnyIpv4(aws_ec2.Port.tcp(8080));
    cdkUtil.tagItem(securityGroup, securityGroupId);

    const fargateServiceId = cdkUtil.microSvcNameResourcePrefix + '-fargateService';
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
        name: cdkUtil.microSvcNameResourcePrefix,
        cloudMapNamespace: dnsNamespace,
        dnsRecordType: DnsRecordType.SRV,
      },
    });
    cdkUtil.tagItem(fargateService, fargateServiceId);

    apiGateway.addRoutes({
      integration: new apigatewayv2_integrations.HttpServiceDiscoveryIntegration(
          `${cdkUtil.microSvcNameResourcePrefix}-ServiceDiscoveryIntegration`,
          //@ts-ignore
          fargateService.cloudMapService,
          {
            vpcLink: vpcLink,
          },
      ),
      path: '/microa/{proxy+}',
      methods: [HttpMethod.GET],
    });

  }
}