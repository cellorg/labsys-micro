import * as cdk from 'aws-cdk-lib';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import * as cdkUtil from '../../common/cdkUtil';

export interface LabsysSecrets {
    PDP_OWNER_PASSWORD: ISecret;
}

export class SharedSecretsStack extends cdk.Stack {
    readonly labsysScrets: {
        PDP_OWNER_PASSWORD: ISecret
    };

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const pdpOwnerPassword = Secret.fromSecretNameV2(this, cdkUtil.pdpOwnerPasswordId, cdkUtil.pdpOwnerPasswordId);

        this.labsysScrets = {
            PDP_OWNER_PASSWORD: pdpOwnerPassword,
        };
    }
}