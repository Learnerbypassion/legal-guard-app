const ImageKit = require('@imagekit/nodejs');
const { Readable } = require('stream');

const client = new ImageKit({
  privateKey: process.env['IMAGEKIT_PRIVATE_KEY'],
  urlEndpoint: process.env['IMAGEKIT_URL_ENDPOINT'],
});

/**
 * Upload image to ImageKit
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} fileName - File name
 * @returns {Promise<{ url: string, fileId: string }>}
 */
const uploadImageToImageKit = async (fileBuffer, fileName) => {
  try {
    if (!process.env['IMAGEKIT_PRIVATE_KEY'] || !process.env['IMAGEKIT_URL_ENDPOINT']) {
      throw new Error('ImageKit credentials are not configured. Please set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT in environment variables.');
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('File buffer is empty or undefined');
    }

    // Convert Buffer to Readable stream for ImageKit
    const fileStream = Readable.from(fileBuffer);

    const response = await client.files.upload({
      file: fileStream,
      fileName: fileName,
      folder: '/legal-guardian/documents',
    });

    return {
      url: response.url,
      fileId: response.fileId,
      name: response.name,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
};

/**
 * Delete image from ImageKit
 * @param {string} fileId - ImageKit file ID
 * @returns {Promise<boolean>}
 */
const deleteImageFromImageKit = async (fileId) => {
  try {
    await client.files.delete(fileId);
    return true;
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error(`ImageKit delete failed: ${error.message}`);
  }
};

module.exports = {
  uploadImageToImageKit,
  deleteImageFromImageKit,
  client,
};