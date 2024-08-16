import { TestAttachment } from "models";
import { parse } from "path";
import { readFile } from "fs/promises";
import { Configuration } from "./Configuration";
import { S3Client, S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3";

export const processAttachments = async (attachments?: TestAttachment[]) => {
  const {
    azureContainerSas,
    azureContainerUrl,
    s3AccessKey,
    s3BucketName,
    s3BucketRegion,
    s3SecretKey,
  } = Configuration.config;

  if (!attachments || attachments.length === 0) {
    return;
  }

  const mediaFiles: { name: string; url: string }[] = [];

  if (attachments.length > 0) {
    attachments = attachments.filter(
      (a) => a.contentType.startsWith("image/") && a.path
    );

    for (const attachment of attachments) {
      try {
        // if (attachment.path && azureContainerUrl && azureContainerSas) {
        //   const parsedFile = parse(attachment.path);
        //   const fileUrl = `${azureContainerUrl}/${
        //     parsedFile.name
        //   }_${Date.now()}${parsedFile.ext}`;

        //   const putResponse = await fetch(`${fileUrl}?${azureContainerSas}`, {
        //     method: "PUT",
        //     headers: {
        //       "x-ms-blob-type": "BlockBlob",
        //       "x-ms-blob-content-type": attachment.contentType,
        //     },
        //     body: await readFile(attachment.path),
        //   });

        //   if (putResponse.ok) {
        //     mediaFiles.push({
        //       name: attachment.name,
        //       url: fileUrl,
        //     });
        //   } else {
        //     console.log(`Failed to upload attachment: ${attachment.name}`);
        //     console.log(`Response: ${putResponse.statusText}`);
        //   }
        // }

        if (
          attachment.path &&
          s3AccessKey &&
          s3BucketName &&
          s3BucketRegion &&
          s3SecretKey
        ) {
          const config: S3ClientConfig = {
            region: "us-east-1",
            credentials: {
              accessKeyId: s3AccessKey,
              secretAccessKey: s3SecretKey,
            },
          };
          const s3Client = new S3Client(config);

          const parsedFile = parse(attachment.path);
          const fileName = `${parsedFile.name}_${Date.now()}${parsedFile.ext}`;

          const response = await s3Client.send(
            new PutObjectCommand({
              Bucket: s3BucketName,
              Key: fileName,
              Body: await readFile(attachment.path),
              ContentType: attachment.contentType,
            })
          );

          if (response.ETag) {
            mediaFiles.push({
              name: attachment.name,
              url: `https://${s3BucketName}.s3.amazonaws.com/${fileName}`,
            });
          } else {
            console.log(`Failed to upload attachment: ${attachment.name}`);
          }
        }
      } catch (e) {
        console.log(`Failed to upload attachment: ${attachment.name}`);
        console.log((e as Error).message);
      }
    }
  }

  return mediaFiles;
};
