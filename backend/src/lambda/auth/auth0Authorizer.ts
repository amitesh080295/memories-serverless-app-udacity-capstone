import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";

import { verify, decode } from "jsonwebtoken";
import { createLogger } from "../../utils/logger";
import Axios from "axios";
import { Jwt } from "../../auth/Jwt";
import { JwtPayload } from "../../auth/JwtPayload";

const logger = createLogger("auth");

const jwksUrl = "https://dev-ti3nhk8f.auth0.com/.well-known/jwks.json";

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing a user", event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("User not authorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  logger.info("Getting the JSON Web Key Set");

  const response = await Axios.get(jwksUrl);
  const keysObject: any = response.data;

  const keys: any[] = keysObject.keys;

  logger.info("Extracting the signing keys");

  const signingKeys = keys
    .filter(
      (key) =>
        key.use === "sig" &&
        key.kty === "RSA" &&
        key.kid &&
        ((key.x5c && key.x5c.length) || (key.n && key.e))
    )
    .map((key) => {
      return { key: key.kid, publicKey: certToPEM(key.x5c[0]) };
    });

  const signingKey = signingKeys.find(
    (signingKey) => signingKey.key === jwt.header.kid
  );

  logger.info("Verifying");

  return verify(token, signingKey.publicKey, {
    algorithms: ["RS256"],
  }) as JwtPayload;
}

function certToPEM(certificate: string): string {
  logger.info("Creating the certificate");

  return (
    "-----BEGIN CERTIFICATE-----\n" +
    certificate +
    "\n-----END CERTIFICATE-----"
  );
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}
