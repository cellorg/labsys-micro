import * as cdkUtil from '../../common/cdkUtil'
import * as cdk from 'aws-cdk-lib';
import { aws_ec2 } from 'aws-cdk-lib';

export class SharedVpcStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new aws_ec2.Vpc(this, cdkUtil.vpcId, {
            vpcName: cdkUtil.vpcId,
            maxAzs: cdkUtil.maxAzs,
        });
        cdkUtil.tagItem(vpc, cdkUtil.vpcId);

    }
}
