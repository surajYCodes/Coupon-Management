import express from 'express';
import {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    getApplicableCoupons,
    applyCoupon,
} from '../controllers/couponController.js';

const router = express.Router();

router.post('/coupons', createCoupon);
router.get('/coupons', getCoupons);
router.get('/coupons/:id', getCouponById);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.post('/applicable-coupons', getApplicableCoupons);
router.post('/apply-coupon/:id', applyCoupon);

export default router;