const request = require("supertest");
const express = require("express");

const app = express();
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
  res.status(201).send(cart);
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

  orders.push({ cart, total, discount });
  cart = [];

  currentOrderCount++;
  if (currentOrderCount % nthOrder === 0) {
    const newDiscountCode = `DISCOUNT${Date.now()}`;
    discountCodes.push(newDiscountCode);
  }

  res.status(200).send({ total, discount });
});

// Admin - Generate Discount Code
app.post("/api/admin/generate-discount", (req, res) => {
  if (currentOrderCount % nthOrder === 0) {
    const newDiscountCode = `DISCOUNT${Date.now()}`;
    discountCodes.push(newDiscountCode);
    res.status(201).send({ discountCode: newDiscountCode });
  } else {
    res.status(400).send({ message: "Not eligible for a discount code" });
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
  res.status(200).send({
    itemCount,
    totalPurchaseAmount,
    discountCodes,
    totalDiscountAmount,
  });
});

describe("API Tests", () => {
  it("should add items to the cart", async () => {
    const response = await request(app)
      .post("/api/cart")
      .send({ id: 1, name: "Item 1", price: 100 });
    expect(response.status).toBe(201);
    expect(response.body).toEqual([{ id: 1, name: "Item 1", price: 100 }]);
  });

  it("should checkout and apply discount", async () => {
    await request(app)
      .post("/api/cart")
      .send({ id: 1, name: "Item 1", price: 100 });
    const response = await request(app)
      .post("/api/checkout")
      .send({ discountCode: null });
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(100);
    expect(response.body.discount).toBe(0);
  });

  it("should generate a discount code every nth order", async () => {
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post("/api/cart")
        .send({ id: 1, name: `Item ${i + 1}`, price: 100 });
      await request(app).post("/api/checkout").send({ discountCode: null });
    }
    const response = await request(app).post("/api/admin/generate-discount");
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("discountCode");
  });

  it("should list admin summary", async () => {
    const response = await request(app).get("/api/admin/summary");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("itemCount");
    expect(response.body).toHaveProperty("totalPurchaseAmount");
    expect(response.body).toHaveProperty("discountCodes");
    expect(response.body).toHaveProperty("totalDiscountAmount");
  });
});
