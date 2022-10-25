import * as cdkUtil from '../../common/cdkUtil'
import * as cdk from 'aws-cdk-lib';
import {aws_ec2, aws_iam, aws_servicediscovery} from 'aws-cdk-lib';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import {PrivateDnsNamespace} from "aws-cdk-lib/aws-servicediscovery";

export class SharedInfraStack extends cdk.Stack {
  public readonly vpcLink: apigatewayv2.VpcLink;
  public readonly dnsNamespace: PrivateDnsNamespace;
  public readonly securityGroup: aws_ec2.SecurityGroup;
  public readonly ecsTaskRole: aws_iam.Role;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = aws_ec2.Vpc.fromLookup(this, cdkUtil.vpcId, { vpcName: cdkUtil.vpcId });

    this.vpcLink = new apigatewayv2.VpcLink(this, cdkUtil.vpcLinkId, {
      vpc: vpc,
      vpcLinkName: cdkUtil.vpcLinkId,
    });
    cdkUtil.tagItem(this.vpcLink, cdkUtil.vpcLinkId);

    //@ts-ignore
    this.dnsNamespace = new aws_servicediscovery.PrivateDnsNamespace(this, cdkUtil.cloudMapDnsNamespaceId,{
      name: `${cdkUtil.applicationName}.local`,
      vpc: vpc,
      description: 'Private DnsNamespace for Microservices',
    });
    cdkUtil.tagItem(this.dnsNamespace, cdkUtil.cloudMapDnsNamespaceId);

    //@ts-ignore
    this.securityGroup = new aws_ec2.SecurityGroup(this, cdkUtil.securityGroupId, {
      securityGroupName: cdkUtil.securityGroupId,
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Allow traffic to Fargate HTTP API service.',
    });
    this.securityGroup.connections.allowFromAnyIpv4(aws_ec2.Port.tcp(8080));
    cdkUtil.tagItem(this.securityGroup, cdkUtil.securityGroupId);

    this.ecsTaskRole = new aws_iam.Role(this, 'labsys-BackendECSTaskRole', {
      roleName: 'labsys-BackendECSTaskRole',
      assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AmazonECSTaskExecutionRolePolicy'
        ),
      ],
    });
  }
}
