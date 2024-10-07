import express from 'express';
import couponRoutes from './couponRoutes.js';


const router = express.Router();

router.use("/coupon",couponRoutes);

export default router;