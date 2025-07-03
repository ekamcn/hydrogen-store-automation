/**
 * Utility function to convert a file to base64 string
 * @param file - The file to convert
 * @returns Promise that resolves to the base64 string (without data URL prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64String = reader.result?.toString().split(',')[1];
      resolve(base64String || '');
    };
    reader.onerror = error => reject(error);
  });
};
