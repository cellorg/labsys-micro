#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {SharedVpcStack} from "../lib/shared-vpc-stack";

const accountRegionEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION //'us-east-1'
};

const app = new cdk.App();

new SharedVpcStack(app, 'labsys-vpc-stack', {
    env: accountRegionEnv,
});
