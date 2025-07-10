const cloudinary = require('../config/cloudinary');

const uploadImage = async (image) => {
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'ecommerce/products',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};

module.exports = { uploadImage };