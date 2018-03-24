import axios from "axios";

import { BUCKET_MEDIA_TEMP, GOOGLE_CLOUD_API_KEY } from "./config";
import { sanitizeFileName } from "../../helpers/sanitizeFilename";

export const uploadFile = file => {
  const fileName = sanitizeFileName(file.name);

  console.log(fileName);

  const config = {
    headers: {
      "Content-Type": file.type
    }
  };

  return axios.post(
    `https://www.googleapis.com/upload/storage/v1/b/${BUCKET_MEDIA_TEMP}/o?uploadType=media&name=${Date.now()}-${fileName}&key=${GOOGLE_CLOUD_API_KEY}`,
    file,
    config
  );
};
