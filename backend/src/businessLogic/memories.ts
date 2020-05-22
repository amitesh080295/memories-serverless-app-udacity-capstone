import * as uuid from "uuid";

import { MemoryItem } from "../models/MemoryItem";
import { MemoryAccess } from "../dataLayer/memoriesAccess";
import { S3Access } from "../dataLayer/s3Access";
import { CreateMemoryRequest } from "../requests/CreateMemoryRequest";
import { UpdateMemoryRequest } from "../requests/UpdateMemoryRequest";
import { parseUserId } from "../auth/utils";

const memoryAccess = new MemoryAccess();
const s3Access = new S3Access();

export async function getAllMemories(jwtToken: string): Promise<MemoryItem[]> {
  const userId = parseUserId(jwtToken);

  const memories = await memoryAccess.getAllMemories(userId);

  memories.forEach(async (memory: MemoryItem) => {
    if (memory.attachmentUrl) {
      if (memory.attachmentUrl !== "") {
        const attachmentUrl = await s3Access.getRetrieveUrl(
          memory.attachmentUrl
        );
        memory.attachmentUrl = attachmentUrl;
      }
    }
  });

  return memories;
}

export async function createMemory(
  createMemoryRequest: CreateMemoryRequest,
  jwtToken: string
): Promise<MemoryItem> {
  const itemId = uuid.v4();
  const userId = parseUserId(jwtToken);

  let attachmentUrl = "";

  if (createMemoryRequest.attachmentUrl) {
    attachmentUrl = createMemoryRequest.attachmentUrl;
  }

  return await memoryAccess.createMemory({
    memoryId: itemId,
    userId: userId,
    name: createMemoryRequest.name,
    memoryDate: createMemoryRequest.memoryDate,
    attachmentUrl: attachmentUrl,
    favorite: false,
    createdAt: new Date().toISOString(),
  });
}

export async function updateMemory(
  updateMemoryRequest: UpdateMemoryRequest,
  jwtToken: string,
  memoryId: string
): Promise<string> {
  const userId = parseUserId(jwtToken);

  return await memoryAccess.updateMemory(updateMemoryRequest, userId, memoryId);
}

export async function updateAttachmentUrl(
  jwtToken: string,
  memoryId: string
): Promise<string> {
  const userId = parseUserId(jwtToken);

  return await memoryAccess.updateAttachmentUrl(userId, memoryId);
}

export async function deleteMemory(
  jwtToken: string,
  memoryId: string
): Promise<string> {
  const userId = parseUserId(jwtToken);

  return await memoryAccess.deleteMemory(userId, memoryId);
}
