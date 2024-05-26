import { NextApiRequest, NextApiResponse } from "next";
import { axiosInstance } from ".";

interface CartItem {
  id: string;
  name: string;
  price: number;
}

let cart: CartItem[] = [];

export function addToCart(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const item: CartItem = req.body;
    cart.push(item);
    res.status(201).json(cart);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}


export const asd = axiosInstance({
  baseURL: "/api/checkout",
})