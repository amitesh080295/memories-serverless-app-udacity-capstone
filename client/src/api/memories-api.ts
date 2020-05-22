import { apiEndpoint } from '../config'
import { Memory } from '../types/Memory'
import { CreateMemoryRequest } from '../types/CreateMemoryRequest'
import Axios from 'axios'
import { UpdateMemoryRequest } from '../types/UpdateMemoryRequest'

export async function getMemories(idToken: string): Promise<Memory[]> {
  console.log('Fetching memories')

  const response = await Axios.get(`${apiEndpoint}/memories`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  console.log('Memories:', response.data)
  return response.data.items
}

export async function createMemory(
  idToken: string,
  newMemory: CreateMemoryRequest
): Promise<Memory> {
  const response = await Axios.post(
    `${apiEndpoint}/memories`,
    JSON.stringify(newMemory),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.item
}

export async function patchMemory(
  idToken: string,
  memoryId: string,
  updatedMemory: UpdateMemoryRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/memories/${memoryId}`,
    JSON.stringify(updatedMemory),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
}

export async function deleteMemory(
  idToken: string,
  memoryId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/memories/${memoryId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  memoryId: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/memories/${memoryId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )

  console.log(response.data.uploadUrl)

  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file)
}
