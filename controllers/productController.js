const Product = require("../models/product");
const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../Utils/apiFeatures");
const cloudinary=require('cloudinary');
//create new product => api/v1/admin/product/new
exports.newproduct = catchAsyncError(async (req, res, next) => {
  let images = []
    if (typeof( req.body.images) === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

  req.body.images = imagesLinks
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(201).json({
    success:true,
    message: "product created successfully",
    product,
  });
});

// Get all products (Admin)  =>   /api/v1/admin/products
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {

  const products = await Product.find();

  res.status(200).json({
      success: true,
      products
  })

})

//get all products => /api/v1/products
exports.getproducts = catchAsyncError(async (req, res, next) => {
  const resPerPage = 8;
  const productsCount = await Product.countDocuments();
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();
  let products = await apiFeatures.query;
  let filteredProductsCount = products.length;

  apiFeatures.pagination(resPerPage);
  products = await apiFeatures.query.clone();
  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products,
  });
});

//get single product => /api/v1/product/:id

exports.getsingleproduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

//update a product => /api/v1/admin/product/:id

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  let images = []
    if (typeof(req.body.images) === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if (images !== undefined) {

        // Deleting images associated with the product
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        let imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        req.body.images = imagesLinks

    }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

//delete product => api/v1/admin/product/:id

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  await Product.findByIdAndRemove(req.params.id);
  res.status(200).json({
    success: true,
    message: "Product is deleted",
  });
});

//creating a review => api/v1/review

exports.createReview = catchAsyncError(async (req, res, next) => {
  const { comment, rating, productId } = req.body;
  const product = await Product.findById(productId);
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  //checking if already reviewed
  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() == req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
  }
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

//get product reviews => api/v1/reviews

exports.getProductreviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
//delete review =>api/v1/review/delete
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );
  const numofReviews = reviews.length;
  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numofReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
