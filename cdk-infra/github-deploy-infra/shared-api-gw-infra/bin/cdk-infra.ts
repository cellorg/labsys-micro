#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SharedApiGatewayStack } from '../lib/shared-apigateway-stack';
import * as cdkUtil from '../../common/cdkUtil';

const accountRegionEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};

const app = new cdk.App();
new SharedApiGatewayStack(app, cdkUtil.sharedApiGatewayStackId, {
    env: accountRegionEnv,
});






