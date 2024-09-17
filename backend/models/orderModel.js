// models/orderModel.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      quantity: Number,
      price: Number,
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add this line
    },
  ],
  amount: Number,
  address: Object,
  payment: { type: Boolean, default: false },
  status: { type: String, default: 'Pending' },
});

export default mongoose.model('Order', orderSchema);
