import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import foodModel from '../models/foodModel.js'
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//config variables
const currency = "usd";
const deliveryCharge = 5;
const frontend_URL = 'http://localhost:5173';

// Placing User Order for Frontend using stripe
// orderController.js
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;  // Retrieve user ID from authenticated user
    console.log('User ID:', userId);

    if (!userId) {
      throw new Error('User ID is undefined');
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID ${userId}`);
    }

    const cartData = user.cartData;

    if (!cartData || Object.keys(cartData).length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Fetch items and include seller information
    const items = await Promise.all(
      Object.keys(cartData).map(async (itemId) => {
        const product = await foodModel.findById(itemId);
        if (!product) {
          throw new Error(`Product not found with ID ${itemId}`);
        }
        return {
          productId: product._id,
          quantity: cartData[itemId],
          price: product.price,
          sellerId: product.owner, // Assuming 'owner' is the seller's user ID
          name: product.name,
        };
      })
    );

    // Group items by seller
    const itemsBySeller = items.reduce((acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      acc[item.sellerId].push(item);
      return acc;
    }, {});

    const orderIds = [];
    const clientSecrets = [];

    for (const sellerId in itemsBySeller) {
      const sellerItems = itemsBySeller[sellerId];
      const amount = sellerItems.reduce((total, item) => total + item.price * item.quantity, 0);
    console.log(req.body)

      const newOrder = new orderModel({
        userId,
        items: sellerItems,
        amount,
        address: req.body.address,
      });
      await newOrder.save();
      orderIds.push(newOrder._id);

      const seller = await userModel.findById(sellerId);

      if (!seller || !seller.stripeAccountId) {
        return res.status(400).json({ success: false, message: 'Seller is not connected to Stripe' });
      }

      console.log('reached here')
      console.error('reached here')


      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        payment_method_types: ['card'],
        application_fee_amount: calculateApplicationFee(amount * 100),
        transfer_data: {
          destination: seller.stripeAccountId,
        },
        metadata: {
          orderId: newOrder._id.toString(),
        },
      });

      clientSecrets.push(paymentIntent.client_secret);
    }

    // Clear the user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      clientSecrets,
      orderIds,
    });
  } catch (error) {
    console.error('Error in placeOrder:', error);
    res.status(500).json({ success: false, message: 'Error placing order', error: error.message });
  }
};

  

// Placing User Order for Frontend using stripe
const placeOrderCod = async (req, res) => {
  try {
    const userId = req.user.id; // Retrieve user ID from authenticated user
    const user = await userModel.findById(userId);
    const cartData = user.cartData;

    if (!cartData || Object.keys(cartData).length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const items = await Promise.all(
      Object.keys(cartData).map(async (itemId) => {
        const product = await foodModel.findById(itemId);
        if (!product) {
          throw new Error(`Product not found with ID ${itemId}`);
        }
        return {
          productId: product._id,
          quantity: cartData[itemId],
          price: product.price,
          sellerId: product.owner,
          name: product.name,
        };
      })
    );

    const amount = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address: req.body.address,
      payment: false,
    });
    await newOrder.save();

    // Clear the user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: 'Order Placed' });
  } catch (error) {
    console.error('Error in placeOrderCod:', error);
    res.status(500).json({ success: false, message: 'Error placing order', error: error.message });
  }
};

  

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const listOrderByUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authenticateUser middleware sets req.user
        const userItems = await Food.find({ owner: userId }); // Filter items by owner
        console.log(`user items- ${userItems}`)
        res.json({ success: true, data: userItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching items' });
    }
};


// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }

}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        res.json({ success: false, message: "Not  Verified" })
    }

}

export { placeOrder, userOrders, updateStatus, verifyOrder, placeOrderCod, listOrderByUser }