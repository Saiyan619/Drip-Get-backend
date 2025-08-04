const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'ecommerce/products',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });

    
    // Delete local file
    fs.unlinkSync(imagePath);

    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    throw new Error('Image upload failed');
  }
};

module.exports = { uploadImage };
