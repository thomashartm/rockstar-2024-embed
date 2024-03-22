import {GetSecretValueCommand, SecretsManagerClient} from '@aws-sdk/client-secrets-manager';


const getSecretValue = async (secretName: string, isJSON = true) => {
  const client = new SecretsManagerClient({
    region: 'eu-central-1',
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  const secret = response.SecretString;
  if (isJSON && secret) {
    return JSON.parse(secret);
  }
  if (!isJSON && secret) {
    return secret;
  }
  return {};
};

export default getSecretValue;
