import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

/**
 * Fetches a decrypted parameter from AWS Systems Manager Parameter Store.
 * Falls back to local environment variables if AWS is unavailable.
 */
export async function getSecureParameter(name, fallbackEnvVar) {
  try {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    });
    const response = await ssmClient.send(command);
    return response.Parameter?.Value;
  } catch (error) {
    console.warn(`[AWS SSM] Fallback for ${name}:`, error.message);
    return process.env[fallbackEnvVar];
  }
}