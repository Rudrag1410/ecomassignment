"use client";

import ProductList from "@/app/components/ProductList";
import Cart from "./components/Cart";
import { useState } from "react";
import Navbar from "./components/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar setIsCartOpen={setIsCartOpen} />
      <ProductList />
      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </QueryClientProvider>
  );
}
