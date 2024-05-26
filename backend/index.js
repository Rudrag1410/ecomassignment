const express = require("express");
const cors = require("cors");

const app = express();
const port = 4000;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 200,
  credentials: true, // if your frontend is using cookies
};

app.use(cors(corsOptions));
app.use(express.json());

let cart = [];
let orders = [];
let discountCodes = [];
let nthOrder = 5; // Every 5th order gets a discount code
let currentOrderCount = 0;

// Add item to cart
app.post("/api/cart", (req, res) => {
  const item = req.body;
  cart.push(item);
  res.status(201).json(cart);
});

// Checkout
app.post("/api/checkout", (req, res) => {
  const { discountCode } = req.body;
  let total = cart.reduce((sum, item) => sum + item.price, 0);
  let discount = 0;

  if (discountCode && discountCodes.includes(discountCode)) {
    discount = total * 0.1;
    total -= discount;
    discountCodes = discountCodes.filter((code) => code !== discountCode);
  }

  orders.push({ cart: [...cart], total, discount });
  cart = [];

  currentOrderCount++;
  if (currentOrderCount % nthOrder === 0) {
    const newDiscountCode = `DISCOUNT${Date.now()}`;
    discountCodes.push(newDiscountCode);
  }

  res.status(200).json({ total, discount });
});

// Admin - Generate Discount Code
app.post("/api/admin/generate-discount", (req, res) => {
  if (currentOrderCount % nthOrder === 0) {
    const newDiscountCode = `DISCOUNT${Date.now()}`;
    discountCodes.push(newDiscountCode);
    res.status(201).json({ discountCode: newDiscountCode });
  } else {
    res.status(400).json({ message: "Not eligible for a discount code" });
  }
});

// Admin - List Summary
app.get("/api/admin/summary", (req, res) => {
  const totalPurchaseAmount = orders.reduce(
    (sum, order) => sum + order.total,
    0
  );
  const totalDiscountAmount = orders.reduce(
    (sum, order) => sum + order.discount,
    0
  );
  const itemCount = orders.reduce((sum, order) => sum + order.cart.length, 0);
  res.status(200).json({
    itemCount,
    totalPurchaseAmount,
    discountCodes,
    totalDiscountAmount,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
