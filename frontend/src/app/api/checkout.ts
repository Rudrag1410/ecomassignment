import { NextApiRequest, NextApiResponse } from "next";

interface CartItem {
  id: string;
  name: string;
  price: number;
}

interface Order {
  cart: CartItem[];
  total: number;
  discount: number;
}

let cart: CartItem[] = [];
let orders: Order[] = [];
let discountCodes: string[] = [];
let nthOrder = 5;
let currentOrderCount = 0;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { discountCode }: { discountCode: string } = req.body;
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
