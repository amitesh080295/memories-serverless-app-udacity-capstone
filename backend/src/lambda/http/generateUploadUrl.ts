import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from "aws-lambda";

import { S3Access } from "../../dataLayer/s3Access";
import { updateAttachmentUrl } from "../../businessLogic/memories";

const s3Access = new S3Access();

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];

  const memoryId = event.pathParameters.memoryId;

  const uploadUrl = await s3Access.getUploadUrl(memoryId);
  await updateAttachmentUrl(jwtToken, memoryId);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      uploadUrl,
    }),
  };
};
