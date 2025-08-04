const Product = require('../models/Product');
const { uploadImage } = require('../utils/cloudinaryUtils');

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v');
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};


const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, salePrice } = req.body;

    // Parse variants if it's stringified (from FormData)
    let variants = [];
    if (typeof req.body.variants === 'string') {
      variants = JSON.parse(req.body.variants);
    } else {
      variants = req.body.variants || [];
    }

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(
        req.files.map((file) => uploadImage(file.path))
      );
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      salePrice,
      images: uploadedImages,
      variants,
      isActive: true,
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, salePrice, isActive } = req.body;

    // Parse variants (from FormData stringified JSON)
    let variants = [];
    if (typeof req.body.variants === 'string') {
      variants = JSON.parse(req.body.variants);
    } else {
      variants = req.body.variants || [];
    }

    // Handle new image uploads
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(
        req.files.map((file) => uploadImage(file.path))
      );
    }

    const updatePayload = {
      name,
      description,
      category,
      price,
      salePrice,
      variants,
      isActive,
    };

    // Only update images if new ones are uploaded
    if (uploadedImages.length > 0) {
      updatePayload.images = uploadedImages;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-__v');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted (set to inactive)' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};