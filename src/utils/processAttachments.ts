import { TestAttachment } from "models";
import { parse } from "path";
import { readFile } from "fs/promises";
import { Configuration } from "./Configuration";

export const processAttachments = async (attachments?: TestAttachment[]) => {
  const { azureContainerSas, azureContainerUrl } = Configuration.config;

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
        if (attachment.path) {
          const parsedFile = parse(attachment.path);
          const fileUrl = `${azureContainerUrl}/${
            parsedFile.name
          }_${Date.now()}${parsedFile.ext}`;
          const putResponse = await fetch(`${fileUrl}?${azureContainerSas}`, {
            method: "PUT",
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "x-ms-blob-content-type": attachment.contentType,
            },
            body: await readFile(attachment.path),
          });

          if (putResponse.ok) {
            mediaFiles.push({
              name: attachment.name,
              url: fileUrl,
            });
          } else {
            console.log(`Failed to upload attachment: ${attachment.name}`);
            console.log(`Response: ${putResponse.statusText}`);
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