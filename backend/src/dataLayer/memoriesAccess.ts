import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

import { createLogger } from "../utils/logger";
const logger = createLogger("auth");

import { MemoryItem } from "../models/MemoryItem";
import { MemoryUpdate } from "../models/MemoryUpdate";

export class MemoryAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly memoriesTable = process.env.MEMORIES_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
  ) {}

  async getAllMemories(userId: string): Promise<MemoryItem[]> {
    logger.info("Getting all memories");

    const result = await this.docClient
      .query({
        TableName: this.memoriesTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as MemoryItem[];
  }

  async getMemory(userId: string, memoryId: string): Promise<MemoryItem> {
    const result = await this.docClient
      .query({
        TableName: this.memoriesTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: "userId = :userId and memoryId = :memoryId",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":memoryId": memoryId,
        },
      })
      .promise();

    const items = result.Items;
    return items[0] as MemoryItem;
  }

  async createMemory(memoryItem: MemoryItem): Promise<MemoryItem> {
    await this.docClient
      .put({
        TableName: this.memoriesTable,
        Item: memoryItem,
      })
      .promise();

    return memoryItem;
  }

  async updateMemory(
    memoryUpdate: MemoryUpdate,
    userId: string,
    memoryId: string
  ): Promise<string> {
    logger.info("Getting the memoryItem for the ID: ", memoryId);

    const memory = await this.getMemory(userId, memoryId);

    logger.info("Updating the memoryItem for the ID: ", memoryId);

    const updatedMemory = await this.docClient
      .update({
        TableName: this.memoriesTable,
        Key: {
          userId: userId,
          createdAt: memory.createdAt,
        },
        UpdateExpression:
          "set #a = :name, memoryDate = :memoryDate, favorite = :favorite",
        ExpressionAttributeNames: {
          "#a": "name",
        },
        ConditionExpression: "memoryId = :memoryId",
        ExpressionAttributeValues: {
          ":name": memoryUpdate.name,
          ":memoryDate": memoryUpdate.memoryDate,
          ":favorite": memoryUpdate.favorite,
          ":memoryId": memoryId,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();

    logger.info("Updated Memory ", updatedMemory);

    return "Successfully updated";
  }

  async updateAttachmentUrl(userId: string, memoryId: string): Promise<string> {
    logger.info("Getting the memoryItem for the ID: ", memoryId);

    const memory = await this.getMemory(userId, memoryId);

    logger.info("Updating the attachmentUrl for the ID: ", memoryId);

    const updatedMemory = await this.docClient
      .update({
        TableName: this.memoriesTable,
        Key: {
          userId: userId,
          createdAt: memory.createdAt,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ConditionExpression: "memoryId = :memoryId",
        ExpressionAttributeValues: {
          ":attachmentUrl": memoryId,
          ":memoryId": memoryId,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();

    logger.info("Updated Memory ", updatedMemory);

    return "Successfully updated";
  }

  async deleteMemory(userId: string, memoryId: string): Promise<string> {
    logger.info("Getting the memoryItem for the ID: ", memoryId);

    const memory = await this.getMemory(userId, memoryId);

    logger.info("Deleting the memoryItem for the ID: ", memoryId);

    await this.docClient
      .delete({
        TableName: this.memoriesTable,
        Key: {
          userId: userId,
          createdAt: memory.createdAt,
        },
        ConditionExpression: "memoryId = :memoryId",
        ExpressionAttributeValues: {
          ":memoryId": memoryId,
        },
      })
      .promise();

    return `Memory #${memoryId} successfully deleted`;
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
