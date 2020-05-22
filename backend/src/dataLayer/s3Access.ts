import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";

const XAWS = AWSXRay.captureAWS(AWS);

export class S3Access {
  constructor(
    private readonly s3 = createS3Client(),
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpriration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getUploadUrl(memoryId: string): Promise<string> {
    return this.s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: memoryId,
      Expires: this.urlExpriration,
    });
  }

  async getRetrieveUrl(memoryId: string): Promise<string> {
    return this.s3.getSignedUrl("getObject", {
      Bucket: this.bucketName,
      Key: memoryId,
      Expires: this.urlExpriration,
    });
  }
}

function createS3Client() {
  return new XAWS.S3({
    signatureVersion: "v4",
  });
}
