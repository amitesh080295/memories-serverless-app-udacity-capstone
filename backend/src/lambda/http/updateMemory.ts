import "source-map-support/register";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

import { UpdateMemoryRequest } from "../../requests/UpdateMemoryRequest";
import { updateMemory } from "../../businessLogic/memories";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization;
  const split = authorization.split(" ");
  const jwtToken = split[1];

  const memoryId = event.pathParameters.memoryId;
  const updatedMemory: UpdateMemoryRequest = JSON.parse(event.body);

  await updateMemory(updatedMemory, jwtToken, memoryId);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: "",
  };
};
