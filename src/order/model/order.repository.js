import OrderModel from "./order.schema.js";

export const createNewOrderRepo = async (data) => {
  // Write your code here for placing a new order
  try {
    // Create a new order using the provided data
    const newOrder = await OrderModel.create(data);

    return newOrder;
  } catch (error) {
    // Handle errors appropriately
    console.error("Error in createNewOrderRepo:", error);
    throw new Error("Error creating a new order");
  }
};
