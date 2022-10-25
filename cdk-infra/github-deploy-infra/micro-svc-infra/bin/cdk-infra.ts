#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as cdkUtil from '../../common/cdkUtil';
import { SharedInfraStack } from '../lib/shared-infra-stack';
import { ServiceInfraStackProps } from '../lib/micro-svc-stacks';
import { MicroSvcStack } from '../lib/micro-svc-stacks';
import {SharedSecretsStack} from "../lib/shared-secrets-stack";

const accountRegionEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION //'us-east-1'
};

const app = new cdk.App();

const sharedSecretsStack = new SharedSecretsStack(app, cdkUtil.sharedSecretsStackId, {
    env: accountRegionEnv
});

const sharedInfraStack = new SharedInfraStack(app, cdkUtil.sharedInfraStackId, {
    env: accountRegionEnv
});

const svcProps : ServiceInfraStackProps = {
    env: accountRegionEnv,
    vpcLink: sharedInfraStack.vpcLink,
    dnsNamespace: sharedInfraStack.dnsNamespace,
    securityGroup: sharedInfraStack.securityGroup,
    ecsTaskRole: sharedInfraStack.ecsTaskRole,
    sharedSecrets: sharedSecretsStack.labsysScrets,
}

new MicroSvcStack(
    app,
    cdkUtil.applicationName + '-microa-stack',
    svcProps,
    'microa'
);

new MicroSvcStack(
    app,
    cdkUtil.applicationName + '-animal-stack',
    svcProps,
    'animal'
);



