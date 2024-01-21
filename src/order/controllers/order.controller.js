// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    // Extract necessary information from the request body or headers
    const { shippingInfo, orderedItems, paymentInfo,paidAt, itemsPrice, taxPrice, shippingPrice, totalPrice, orderStatus } = req.body;
    const { _id: userId } = req.user; // Assuming req.user contains user information
    // Create a new order using the repository function
    const newOrder = await createNewOrderRepo({
      shippingInfo,
      orderedItems,
      user: userId, // Fix: Assign userId to the user field
      paymentInfo,
      paidAt,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus,
    });

    // Handle successful order creation
    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    // Handle errors appropriately
    console.error("Error in createNewOrder controller:", error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};


