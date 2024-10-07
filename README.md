Getting Started
Prerequisites
Ensure you have the following installed on your system:

Node.js (v16 or higher)
MongoDB (Make sure MongoDB is running, either locally or on a cloud service)
Installation
Clone the repository:

bash
Copy code
git clone <repository-url>
cd <repository-directory>
Install Dependencies:

bash
Copy code
npm install
Start the Server:

For development mode with hot-reloading:
bash
Copy code
npm run dev
For production mode:
bash
Copy code
npm start
Environment Setup:

Create a .env file in the root directory and configure the following variables:
plaintext
Copy code
MONGODB_URI=<Your MongoDB connection string>
PORT=3000
Replace <Your MongoDB connection string> with the URI of your MongoDB instance.


Coupon Management System
Overview
This system provides an API for managing coupons and applying them to shopping carts. The system supports various types of coupons, such as cart-wise, product-wise, and BxGy (Buy X, Get Y) coupons. It allows users to create, retrieve, update, and delete coupons, as well as apply applicable coupons to carts to calculate the total discount.

API Endpoints
POST /coupons - Create a new coupon.
GET /coupons - Retrieve all coupons.
GET /coupons/{id} - Retrieve a specific coupon by ID.
PUT /coupons/{id} - Update a specific coupon by ID.
DELETE /coupons/{id} - Delete a specific coupon by ID.
POST /applicable-coupons - Fetch all applicable coupons for a given cart.
POST /apply-coupon/{id} - Apply a specific coupon to the cart and return the updated cart.Coupon Management System
Overview
This system provides an API for managing coupons and applying them to shopping carts. The system supports various types of coupons, such as cart-wise, product-wise, and BxGy (Buy X, Get Y) coupons. It allows users to create, retrieve, update, and delete coupons, as well as apply applicable coupons to carts to calculate the total discount.

API Endpoints
POST /coupons - Create a new coupon.
GET /coupons - Retrieve all coupons.
GET /coupons/{id} - Retrieve a specific coupon by ID.
PUT /coupons/{id} - Update a specific coupon by ID.
DELETE /coupons/{id} - Delete a specific coupon by ID.
POST /applicable-coupons - Fetch all applicable coupons for a given cart.
POST /apply-coupon/{id} - Apply a specific coupon to the cart and return the updated cart.

Implemented Cases
1. Cart-wise Coupons
Example: 10% off on carts with a total over Rs. 100.
Condition: Cart total must exceed a specified threshold.
Discount: Percentage discount applied to the entire cart total.
2. Product-wise Coupons
Example: 20% off on a specific product.
Condition: The specified product must be present in the cart.
Discount: Percentage discount applied only to the product’s price.
3. BxGy (Buy X, Get Y) Coupons
Example: Buy 2 products from a specified array, get 1 product from another array for free.
Condition: The cart must contain enough items from the "buy" array to satisfy the minimum buy quantity.
Discount: Makes specified items in the "get" array free, up to a maximum repetition limit.

Unimplemented Cases
1. Tiered Discounts
The system does not support tiered discounts (e.g., 10% off for carts over Rs. 100, 20% off for carts over Rs. 200).
Reason: Tiered discounts require handling multiple conditions and thresholds within a single coupon, which are not covered by the current coupon structures.

Limitations
1. Single Discount per Product: A product-wise discount only applies once per product. If a cart has multiple instances of the same product, the discount applies uniformly to all quantities of that product.
2. Limited Condition Logic: Each coupon type has simple condition checks. More complex conditions, such as AND/OR condition logic between multiple criteria, are not supported.
3. No Expiration Logic: The system allows storing expiration dates for coupons, but it doesn’t automatically prevent expired coupons from being applied. It relies on the application logic to ensure that only active coupons are fetched and applied.


Assumptions

Unique Coupon IDs: Each coupon has a unique ID, and the system relies on this ID to identify and apply coupons.
Monetary Values as Integers: All prices and total values are handled as integers. This may require additional handling for decimal places in a real-world currency system.

Non-Overlapping Discounts: Each coupon applies its discount independently of others. Overlapping discounts (e.g., stacking discounts on the same product) are not supported.