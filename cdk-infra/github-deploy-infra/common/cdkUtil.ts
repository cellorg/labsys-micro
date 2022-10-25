import * as cdk from 'aws-cdk-lib';
import {RetentionDays} from "aws-cdk-lib/aws-logs";

// input parameters
const targetEnv = process.env.targetEnv || 'd1';
export const maxAzs = Number(process.env.maxAzs || '1');
export const fargateSvcDesiredCount = Number(process.env.fargateSvcDesiredCount || '1');

export const applicationName = 'labsys';
export const sharedVpcStackId =  applicationName + '-sharedVpc-stack';
export const vpcId = applicationName + '-vpc';
export const sharedApiGatewayStackId =  applicationName + '-sharedApiGateway-stack';
export const apiGatewayId = applicationName + '-apiGateway';
export const exportedApiGatewayId = applicationName + '-apiGatewayId-export';
export const sharedInfraStackId = applicationName + '-sharedInfra-stack';
export const sharedSecretsStackId = applicationName + '-sharedSecrets-stack';

export const vpcLinkId = applicationName + '-vpclink';
export const cloudMapDnsNamespaceId = applicationName + '-dnsNamespace';
export const securityGroupId = applicationName + '-securityGroup';
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