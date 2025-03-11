import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase"; // Import storage, not db

export const uploadImage = async (file: File): Promise<string> => {
  if (!file) return "";
  const fileRef = ref(storage, `speakers/${file.name}`); // Use storage instance here
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};
