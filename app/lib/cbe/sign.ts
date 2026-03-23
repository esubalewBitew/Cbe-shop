import crypto from "crypto";
import nacl from "tweetnacl";
import { fromByteArray, toByteArray } from "base64-js";
import stringify from "json-stable-stringify";

type ContentToSign = Record<string, unknown>;


export function generateSignEd25519(
  content: ContentToSign,
  privateKeyBase64: string
): string {
  const jsonString = stringify(content) as string;
  const dataToSign = new TextEncoder().encode(jsonString);

  const privateKeyBytes = toByteArray(privateKeyBase64);
  if (privateKeyBytes.length !== nacl.sign.secretKeyLength) {
    throw new Error(
      `Invalid private key length: expected ${nacl.sign.secretKeyLength} bytes but got ${privateKeyBytes.length}.`
    );
  }

  const signatureBytes = nacl.sign.detached(dataToSign, privateKeyBytes);
  return fromByteArray(signatureBytes);
}


export function generateConfirmPayloadHMAC(
  content: ContentToSign,
  appSecret: string
): string {
  const jsonString = stringify(content) as string;
  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(jsonString);
  return hmac.digest("hex");
}

