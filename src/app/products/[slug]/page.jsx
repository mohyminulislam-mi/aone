"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { productAPI } from "@/services/api";
import { normalizeProduct, normalizeProducts, oneFrom } from "@/lib/api-data";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const response = await productAPI.getProduct(slug);
        const data = normalizeProduct(oneFrom(response, ["product"]));
        setProduct(data);

        if (data?.category_id) {
          const relResponse = await productAPI.getProducts({
            category_id: data.category_id,
            categoryId: data.category_id,
            limit: 5,
          });
          setRelated(
            normalizeProducts(relResponse)
              .filter((p) => p.id !== data.id)
              .slice(0, 4),
          );
        } else {
          setRelated([]);
        }
      } catch (_error) {
        setProduct(null);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  console.log(product);

  async function handleAddToCart() {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    setAdding(true);

    const { error } = await addItem({
      productId: product.id,
      quantity: quantity,
    });

    setAdding(false);

    if (error) {
      toast.error(error.message || "Failed to add to cart");
    } else {
      toast.success(`${product.name} added to cart`);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-secondary animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-secondary rounded w-1/3 animate-pulse" />
            <div className="h-10 bg-secondary rounded w-2/3 animate-pulse" />
            <div className="h-8 bg-secondary rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-secondary rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const specs = product.specs || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        {product.categories && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/products?category=${product.categories.slug}`}
              className="hover:text-primary"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-secondary/30">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-8xl font-bold text-primary/15">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-sm font-bold px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              {product.categories?.name}
            </Badge>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
                <Badge className="bg-accent text-accent-foreground">
                  Save ${(product.compare_at_price - product.price).toFixed(2)}
                </Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stock > 5 ? (
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <Check className="w-4 h-4" /> In Stock
              </div>
            ) : product.stock > 0 ? (
              <div className="flex items-center gap-1.5 text-sm text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full" /> Only{" "}
                {product.stock} left
              </div>
            ) : (
              <div className="text-sm text-destructive font-medium">
                Out of Stock
              </div>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-secondary transition-colors rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-2.5 hover:bg-secondary transition-colors rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2 font-semibold"
                onClick={handleAddToCart}
                disabled={adding}
              >
                <ShoppingCart className="w-4 h-4" />
                {adding ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          )}

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            {[
              { icon: Truck, label: "Fast Shipping" },
              { icon: Shield, label: "Genuine Product" },
              { icon: RotateCcw, label: "Easy Returns" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-1.5 p-3 bg-secondary/50 rounded-lg"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <dl className="space-y-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <dt className="text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`}>
                <Card className="group cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-secondary to-secondary/30">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-3xl font-bold text-primary/20">
                          {p.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-primary">
                      {p.name}
                    </h3>
                    <span className="text-sm font-bold text-primary">
                      ${p.price.toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
