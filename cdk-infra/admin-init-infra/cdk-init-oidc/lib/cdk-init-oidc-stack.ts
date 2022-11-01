import * as cdk from 'aws-cdk-lib';
import { aws_iam } from 'aws-cdk-lib';

export class CdkInitOidcStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The provider URL and Audience are fixed
    // https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
    const githubProvider = new aws_iam.OpenIdConnectProvider(this, 'githubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const webIdentityPrincipal = new aws_iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:cellorg/*:*"
          }
        }
    );

    const policyDoc = new aws_iam.PolicyDocument({
      statements: [
        new aws_iam.PolicyStatement({
          resources: ['arn:aws:iam::*:role/cdk-*'],
          actions: ['sts:AssumeRole'],
          effect: aws_iam.Effect.ALLOW,
        }),
      ],
    });

    const role = new aws_iam.Role(this, 'gitHubCdkDeployRole', {
      assumedBy: webIdentityPrincipal,
      inlinePolicies: {
        policyDoc
      },
      roleName: 'github-cdk-deploy-role',
      description: 'This role is used via GitHub Actions to deploy with AWS CDK on the target AWS account',
      maxSessionDuration: cdk.Duration.hours(1),
    });

    new cdk.CfnOutput(this, 'exportedGitHubRoleArn', {
      exportName: 'exportedGitHubRoleArn',
      value: role.roleArn
    });
  }
}
