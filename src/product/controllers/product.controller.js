// Please don't change the pre-written code
// Import the necessary modules here

import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
} from "../model/product.repository.js";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getAllProducts = async (req, res, next) => {
  // Implement the functionality for search, filter and pagination this function.
  try {
    // Extract query parameters from req.query
    const { search, category, page, limit } = req.query;

    // Build the query object based on the provided parameters
    const query = {};
    if (search) {
      // Use MongoDB regex operator to search for the specified keyword in the name field
      query.name = { $regex: new RegExp(search, 'i') };
    }
    if (category) {
      query.category = category;
    }
    // Convert page and limit to integers (default to 1 and 10 if not provided)
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 5;

    // Calculate the skip value for pagination
    const skip = (pageNumber - 1) * pageSize;

    // Fetch products from the repository with the constructed query and pagination options
    const products = await getAllProductsRepo(query, { skip, limit: pageSize });

    // You may also want to fetch the total count for pagination information
    const totalCount = await getTotalCountsOfProduct(query);

    // Send the response with the fetched products and pagination information
    res.status(200).json({
      success: true,
      data: {
        products,
        totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    // Handle errors appropriately
    console.error("Error in getAllProducts controller:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };
    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const findRevieweIndex = product.reviews.findIndex((rev) => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach((rev) => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = avgRating / product.reviews.length;
    product.rating = updatedRatingOfProduct;
    await product.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// export const deleteReview = async (req, res, next) => {
//   // Insert the essential code into this controller wherever necessary to resolve issues related to removing reviews and updating product ratings.
//   try {
//     console.log(req.user);
//     const { productId, reviewId } = req.query;
//     if (!productId || !reviewId) {
//       return next(
//         new ErrorHandler(
//           400,
//           "pls provide productId and reviewId as query params"
//         )
//       );
//     }
//     const product = await findProductRepo(productId);
//     if (!product) {
//       return next(new ErrorHandler(400, "Product not found!"));
//     }
//     const reviews = product.reviews;

//     const isReviewExistIndex = reviews.findIndex((rev) => {
//       return rev._id.toString() === reviewId.toString();
//     });
//     if (isReviewExistIndex < 0) {
//       return next(new ErrorHandler(400, "review doesn't exist"));
//     }

//     const reviewToBeDeleted = reviews[isReviewExistIndex];
//     reviews.splice(isReviewExistIndex, 1);

//     await product.save({ validateBeforeSave: false });
//     res.status(200).json({
//       success: true,
//       msg: "review deleted successfully",
//       deletedReview: reviewToBeDeleted,
//       product,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(500, error));
//   }
// };



export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.query;
    const userId = req.user._id; // Assuming req.user contains user information

    if (!productId || !reviewId) {
      return next(new ErrorHandler(400, 'Please provide productId and reviewId as query params'));
    }

    const product = await findProductRepo(productId);

    if (!product) {
      return next(new ErrorHandler(400, 'Product not found!'));
    }

    const reviews = product.reviews;

    const reviewIndex = reviews.findIndex((rev) => rev._id.toString() === reviewId.toString());

    if (reviewIndex < 0) {
      return next(new ErrorHandler(400, "Review doesn't exist"));
    }

    const review = reviews[reviewIndex];

    // Ensure that the user deleting the review is the owner of the review
    if (review.user.toString() !== userId.toString()) {
      return next(new ErrorHandler(403, 'Unauthorized: You can only delete your own reviews'));
    }

    // Remove the review
    reviews.splice(reviewIndex, 1);

    // Update product rating based on remaining reviews
    const newRating = calculateProductRating(product.reviews);
    product.rating = newRating;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      msg: 'Review deleted successfully',
      deletedReview: review,
      product,
    });
  } catch (error) {
    console.error('Error in deleteReview controller:', error);
    return next(new ErrorHandler(500, 'Internal Server Error'));
  }
};

// Function to calculate product rating based on reviews
const calculateProductRating = (reviews) => {
  if (reviews.length === 0) {
    return 0; // If there are no reviews, set the rating to 0
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  return isNaN(averageRating) ? 0 : averageRating;
};
