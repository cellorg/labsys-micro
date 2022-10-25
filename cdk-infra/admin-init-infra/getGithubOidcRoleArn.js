const targetEnv = process.argv[2];
let githubOidcRoleArn;
switch (targetEnv) {
    case 'd1':
        githubOidcRoleArn = 'arn:aws:iam::793330794008:role/github-cdk-deploy-role';
        break;
    case 'd2':
        githubOidcRoleArn = 'arn:aws:iam::743047015654:role/github-cdk-deploy-role';
        break;
    case 't3':
        githubOidcRoleArn = 'arn:aws:iam::750352965823:role/github-cdk-deploy-role';
        break;
    case 'prod':
        githubOidcRoleArn = 'arn:aws:iam::244985974061:role/github-cdk-deploy-role';
        break;
}
console.log(githubOidcRoleArn);
