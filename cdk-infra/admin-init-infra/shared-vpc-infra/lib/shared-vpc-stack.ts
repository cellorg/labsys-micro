import * as cdk from 'aws-cdk-lib';
import { aws_ec2 } from 'aws-cdk-lib';

export class SharedVpcStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new aws_ec2.Vpc(this, 'labsys-vpc', {
            vpcName: 'labsys-vpc',
            maxAzs: 1,
        });
    }
}
