import express from 'express';
import authMiddleware from '../middleware/auth.js';
import foodAuthMiddleware from '../middleware/foodAuth.js';
import {placeOrder,updateStatus,userOrders, verifyOrder, placeOrderCod, listOrderByUser } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get("/list", authMiddleware, listOrderByUser);
orderRouter.post("/userorders",authMiddleware,userOrders);
orderRouter.post("/placeOrder",foodAuthMiddleware,placeOrder);
orderRouter.post("/status",updateStatus);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/placeOrderCod",foodAuthMiddleware,placeOrderCod);

export default orderRouter;