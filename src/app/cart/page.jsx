"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, isReady, subtotal, itemCount, updateQuantity, removeItem } = useCart();

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!isReady) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Start shopping to add items to your cart
        </p>
        <Link href="/products">
          <Button className="gap-2">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({itemCount} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.products;
            const itemTotal = Number(product?.price ?? 0) * item.quantity;

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    <Link
                      href={`/products/${product?.slug ?? item.product_id}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 relative overflow-hidden rounded-lg bg-secondary"
                    >
                      {product?.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name ?? "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-2xl font-bold text-primary/20">
                            {product?.name?.charAt(0) ?? "P"}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${product?.slug ?? item.product_id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                          {product?.name ?? "Product"}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {product?.categories?.name ?? product?.category ?? "General"}
                      </p>
                      <div className="flex items-center justify-between mt-3 gap-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-secondary transition-colors rounded-l-lg"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-secondary transition-colors rounded-r-lg"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">
                            ${itemTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Order Summary</h2>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              {subtotal < 50 && (
                <p className="text-xs text-muted-foreground">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Link href="/checkout" className="w-full">
                <Button size="lg" className="w-full font-semibold gap-2">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
