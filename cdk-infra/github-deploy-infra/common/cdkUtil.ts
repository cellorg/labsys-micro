import * as cdk from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

// input parameters
const targetEnv = process.env.targetEnv || 'd1';
export const fargateSvcDesiredCount = Number(process.env.fargateSvcDesiredCount || '1');

// It is preferred that we deploy all non-prod environments, such as d1, d2, t3, etc., in the same AWS account.
// By sharing the vpc, nat gateways, transit gateway, etc., it may cost less than having each environment in different account.
// Infrastructure team is responsible for creating the vpc. It is outside our github deployment.
export let vpcId = 'labsys-vpc'; // this should match to the existing vpc that the infrastructure team created.

// with the targetEnv, we can uniquely identify the resources for different environments.
export const applicationName = 'labsys-' + targetEnv;
export const sharedApiGatewayStackId =  applicationName + '-sharedApiGateway-stack';
export const apiGatewayId = applicationName + '-apiGateway';
export const exportedApiGatewayId = applicationName + '-apiGatewayId-export';
export const exportedApiGatewayEndpoint = applicationName + '-apiGatewayEndpoint-export';
export const sharedInfraStackId = applicationName + '-sharedInfra-stack';
export const sharedSecretsStackId = applicationName + '-sharedSecrets-stack';
export const cloudMapDnsNamespaceId = applicationName + '-dnsNamespace';
export const securityGroupId = applicationName + '-securityGroup';
export const escTaskRole = applicationName + '-backendECSTaskRole';
export const vpcLinkId = applicationName + '-vpclink';

// Secrets Manager - secrets IDs
export const pdpOwnerPasswordId = targetEnv + '_PDP_OWNER_PASSWORD';

export let awsSvcLogRetentionDays = RetentionDays.ONE_DAY;
let tagEnvironment = process.env.Environment || 'nonprod';

export const PDP_OWNER_USERNAME = 'PDP_OWNER';
export let PDP_OWNER_JDBC_URL = '';
switch (targetEnv) {
    case 'd1':
        PDP_OWNER_JDBC_URL = 'fake:jdbc:url:d1';
        break;
    case 'd2':
        awsSvcLogRetentionDays = RetentionDays.THREE_DAYS;
        PDP_OWNER_JDBC_URL = 'fake:jdbc:url:d2';
        break;
    case 't3':
        PDP_OWNER_JDBC_URL = 'fake:jdbc:url:t3';
        break;
    case 'prod':
        tagEnvironment = 'prod';
        vpcId = 'labsys-vpc'; // overwrite the existing vpc name if it differs from the nonprod
        PDP_OWNER_JDBC_URL = 'fake:jdbc:url:prod';
        break;
}

// tag AWS resources according to https://cellsignal.atlassian.net/wiki/spaces/EA/pages/1399128192/AWS+Use+Standard
export function tagItem(item: any, itemProgram: string) {
    cdk.Tags.of(item).add('program', itemProgram);
    cdk.Tags.of(item).add('role', 'labsys-microservices');
    cdk.Tags.of(item).add('owner', 'Lab Systems');
    cdk.Tags.of(item).add('creator', 'SignalSailer');
    cdk.Tags.of(item).add('environment', tagEnvironment);
    cdk.Tags.of(item).add('deptcode', '245');
}

export function timeStampStr() {
    // format: 2022-10-19T17-35-33-887Z
    return (new Date()).toISOString().split(':').join('-').replace('.', '-');
}