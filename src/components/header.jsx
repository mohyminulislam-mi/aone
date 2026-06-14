"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const categories = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-1.5 text-xs flex items-center justify-between">
          <span>Free shipping on orders over $50</span>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/help" className="hover:underline">
              Help
            </Link>
            {profile?.is_admin && (
              <Link href="/admin" className="hover:underline font-medium">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Mobil<span className="text-primary">Store</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-8">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-secondary"
            >
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-secondary flex items-center gap-1">
                  Products <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/products" className="font-medium">
                    All Products
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link href={`/products?category=${cat.slug}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form action="/products" method="get" className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm border border-transparent focus:border-primary focus:bg-background focus:outline-none transition-colors"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {profile?.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}

            <button
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <form action="/products" method="get" className="relative md:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg text-sm border border-transparent focus:border-primary focus:bg-background focus:outline-none"
              />
            </form>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg"
            >
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm pl-6 hover:bg-secondary rounded-lg text-muted-foreground"
              >
                {cat.name}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg text-primary"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
