import crypto from "crypto";
import nacl from "tweetnacl";
import { fromByteArray, toByteArray } from "base64-js";
import stringify from "json-stable-stringify";

function generateSignEd25519(content, privateKeyBase64) {
  const jsonString = stringify(content);
  const dataToSign = new TextEncoder().encode(jsonString);

  const privateKeyBytes = toByteArray(privateKeyBase64);
  if (privateKeyBytes.length !== nacl.sign.secretKeyLength) {
    throw new Error(
      `Invalid private key length: expected ${nacl.sign.secretKeyLength} but got ${privateKeyBytes.length}`
    );
  }

  const signatureBytes = nacl.sign.detached(dataToSign, privateKeyBytes);
  return fromByteArray(signatureBytes);
}

function generateConfirmPayloadHMAC(content, appSecret) {
  const jsonString = stringify(content);
  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(jsonString);
  return hmac.digest("hex");
}

// Sample payload (matches the previously hardcoded values in CBESuperAppContext.tsx)
const contentToSign = {
  app_code: "092999",
  merchant_code: "663689013779061",
  merchant_reference: "YWKKHY",
  title: "Some title",
  total_amount: 5,
  currency: "ETB",
  credit_account_number: "",
};

// Expected values (previously hardcoded in CBESuperAppContext.tsx)
const expectedSign =
  "tuGTWrSSV5Np/PFvgQn+eG5Xim6BkFxvnut1JfqN7OigiCGj4hs0suUkdPj5kGthQy6+OD0fePitHYFy9fGmDw==";
const expectedConfirmPayload =
  "1b1d2a0881f70b368380f06ce15aba36fa48bd4290ca3803abfdb2574b5ee884";

const appSecret = process.env.CBE_APP_SECRET;
const privateKeyBase64 = process.env.CBE_PRIVATE_KEY;

if (!appSecret || !privateKeyBase64) {
  console.error(
    "Missing env vars. Please set CBE_APP_SECRET and CBE_PRIVATE_KEY."
  );
  process.exit(1);
}

const sign = generateSignEd25519(contentToSign, privateKeyBase64);
const confirm_payload = generateConfirmPayloadHMAC(contentToSign, appSecret);

console.log("--- contentToSign ---");
console.log(contentToSign);
console.log("----------------------");
console.log("Generated sign:", sign);
console.log("Expected sign :", expectedSign);
console.log("Generated confirm_payload:", confirm_payload);
console.log("Expected confirm_payload :", expectedConfirmPayload);

const signOk = sign === expectedSign;
const confirmOk = confirm_payload === expectedConfirmPayload;

if (signOk && confirmOk) {
  console.log("✅ Match: generated values are identical to expected constants.");
} else {
  console.error("❌ Mismatch: signature/HMAC do not match expected constants.");
  process.exit(2);
}

