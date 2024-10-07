import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

const db = getDB();

export const createCoupon = async (req, res) => {
    try {
        const result = await db.collection('coupons').insertOne(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getCoupons = async (req, res) => {
    try {
        const coupons = await db.collection('coupons').find().toArray();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCouponById = async (req, res) => {
    try {
        const coupon = await db.collection('coupons').findOne({ _id: new ObjectId(req.params.id) });
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const result = await db.collection('coupons').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
            { returnOriginal: false }
        );
        if (!result) return res.status(404).json({ message: 'Coupon not found' });
        res.json(result.value);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const result = await db.collection('coupons').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getApplicableCoupons = async (req, res) => {
    try {
        const { cart } = req.body;
        const coupons = await db.collection('coupons').find().toArray();
        
        const applicableCoupons = coupons.filter(coupon => isCouponApplicable(coupon, cart));
        res.json(applicableCoupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to check if a coupon is applicable
const isCouponApplicable = (coupon, cart) => {
    switch (coupon.type) {
        case 'cart-wise':
            return isCartWiseApplicable(coupon, cart);
        case 'product-wise':
            return isProductWiseApplicable(coupon, cart);
        case 'bxgy':
            return isBxGyApplicable(coupon, cart);
        default:
            return false;
    }
};

const isCartWiseApplicable = (coupon, cart) => {
    return cart.total > coupon.condition.minCartValue;
};

const isProductWiseApplicable = (coupon, cart) => {
    return cart.items.some(item => item.productId === coupon.condition.productId);
};

const isBxGyApplicable = (coupon, cart) => {
    const buyItems = cart.items.filter(item => coupon.buy.includes(item.productId));
    const totalBuyQuantity = buyItems.reduce((sum, item) => sum + item.quantity, 0);

    // Check if the required quantity for the "buy" condition is met
    if (totalBuyQuantity < coupon.x) return false;

    const applicableRepetitions = Math.min(
        Math.floor(totalBuyQuantity / coupon.x),
        coupon.repetition_limit || Infinity
    );

    const freeItems = cart.items.filter(item => coupon.get.includes(item.productId));
    const totalFreeQuantity = freeItems.reduce((sum, item) => sum + item.quantity, 0);

    return totalFreeQuantity <= applicableRepetitions * coupon.y;
};

export const applyCoupon = async (req, res) => {
    try {
        const { cart } = req.body;
        const couponId = req.params.id;

        // Retrieve the specific coupon by ID
        const coupon = await db.collection('coupons').findOne({ _id: new ObjectId(couponId) });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Check if the coupon is applicable to the cart
        if (!isCouponApplicable(coupon, cart)) {
            return res.status(400).json({ message: 'Coupon is not applicable to this cart' });
        }

        // Apply the coupon discount to the cart
        const updatedCart = applyCouponToCart(coupon, cart);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to apply the coupon based on type
const applyCouponToCart = (coupon, cart) => {
    switch (coupon.type) {
        case 'cart-wise':
            return applyCartWiseDiscount(coupon, cart);
        case 'product-wise':
            return applyProductWiseDiscount(coupon, cart);
        case 'bxgy':
            return applyBxGyDiscount(coupon, cart);
        default:
            return cart;
    }
};

// Apply cart-wise discount to the entire cart
const applyCartWiseDiscount = (coupon, cart) => {
    const discountAmount = (cart.total * coupon.discount.percentage) / 100;
    cart.total -= discountAmount;
    cart.appliedDiscount = discountAmount;
    return cart;
};

// Apply product-wise discount to specific products
const applyProductWiseDiscount = (coupon, cart) => {
    cart.items = cart.items.map(item => {
        if (item.productId === coupon.condition.productId) {
            const discountAmount = (item.price * coupon.discount.percentage) / 100;
            item.discountedPrice = item.price - discountAmount;
        }
        return item;
    });

    // Recalculate the cart total
    cart.total = cart.items.reduce((total, item) => total + (item.discountedPrice || item.price) * item.quantity, 0);
    return cart;
};

// Apply BxGy discount to the cart
const applyBxGyDiscount = (coupon, cart) => {
    const buyItems = cart.items.filter(item => coupon.buy.includes(item.productId));
    const totalBuyQuantity = buyItems.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate the number of repetitions for the discount
    const applicableRepetitions = Math.min(
        Math.floor(totalBuyQuantity / coupon.x),
        coupon.repetition_limit || Infinity
    );

    // Apply the discount by making items in the "get" array free
    cart.items = cart.items.map(item => {
        if (coupon.get.includes(item.productId)) {
            const freeQuantity = Math.min(applicableRepetitions * coupon.y, item.quantity);
            const totalPriceReduction = freeQuantity * item.price;
            item.discountedPrice = (item.price * (item.quantity - freeQuantity)) / item.quantity;
        }
        return item;
    });

    // Recalculate the cart total
    cart.total = cart.items.reduce((total, item) => total + (item.discountedPrice || item.price) * item.quantity, 0);
    return cart;
};