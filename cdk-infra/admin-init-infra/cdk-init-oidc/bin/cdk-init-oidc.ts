#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkInitOidcStack } from '../lib/cdk-init-oidc-stack';

const app = new cdk.App();
new CdkInitOidcStack(app, 'labsys-githubOpenIDConnect-stack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});