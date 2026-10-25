import { getSecureParameter } from "../src/lib/ssm.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testSSM() {
  console.log("======================================================");
  console.log("⚡ AWS SYSTEMS MANAGER (SSM) INTEGRATION TEST");
  console.log("======================================================");

  const secret = await getSecureParameter("/p2p/JWT_SECRET", "JWT_SECRET");
  const domain = await getSecureParameter("/p2p/ALLOWED_EMAIL_DOMAIN", "ALLOWED_EMAIL_DOMAIN");

  if (secret) {
    console.log("✅ Successfully retrieved /p2p/JWT_SECRET from AWS SSM (Encrypted at Rest)");
    console.log(`   Masked Value: ${secret.substring(0, 4)}****`);
  } else {
    console.error("❌ Failed to fetch /p2p/JWT_SECRET");
  }

  if (domain) {
    console.log("✅ Successfully retrieved /p2p/ALLOWED_EMAIL_DOMAIN from AWS SSM");
    console.log(`   Value: ${domain}`);
  }

  console.log("======================================================");
}

testSSM();