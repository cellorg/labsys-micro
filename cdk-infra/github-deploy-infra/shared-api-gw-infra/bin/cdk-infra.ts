#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as cdkUtil from '../../common/cdkUtil';
import { SharedApiGatewayStack } from '../lib/shared-apigateway-stack';

const accountRegionEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION //'us-east-1'
};

const app = new cdk.App();

new SharedApiGatewayStack(app, cdkUtil.sharedApiGatewayStackId, {
    env: accountRegionEnv,
});



