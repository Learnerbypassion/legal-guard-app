const imageKit = require("../config/imagekit");

/**
 * Upload image to ImageKit
 * @param {Buffer} buffer - Image file buffer from multer
 * @param {string} filename - Original filename
 * @param {string} folder - Folder in imageKit to store the image
 * @returns {Object} - ImageKit response with secure URL
 */
const uploadImage = async (buffer, filename, folder = "legal-guardian") => {
  try {
    // Validate buffer
    if (!buffer) {
      throw new Error("Buffer is empty or undefined");
    }

    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${filename}`;

    // Convert buffer to base64 string for ImageKit
    const base64File = buffer.toString("base64");

    console.log("📤 Uploading to ImageKit:", {
      fileName: uniqueName,
      folder,
      bufferSize: buffer.length,
      base64Size: base64File.length,
    });

    const response = await imageKit.files.upload({
      file: base64File, // Send as base64 string
      fileName: uniqueName,
      folder: folder,
      isPrivateFile: false,
      useUniqueFileName: true,
    });

    console.log("✅ ImageKit upload successful:", {
      url: response.url,
      fileId: response.fileId,
    });

    return {
      success: true,
      imageUrl: response.url,
      fileId: response.fileId,
      thumbnailUrl: response.thumbnailUrl,
    };
  } catch (error) {
    console.error("❌ ImageKit upload error:", {
      message: error.message,
      status: error.status,
      help: error.help,
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete image from ImageKit
 * @param {string} fileId - ImageKit file ID
 */
const deleteImage = async (fileId) => {
  try {
    await imageKit.deleteFile(fileId);
    return { success: true };
  } catch (error) {
    console.error("❌ ImageKit delete error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
