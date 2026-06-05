'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal, Grid3X3, List, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [view, setView] = useState('grid');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      let catQuery = supabase.from('categories').select('*').order('display_order');
      const { data: cats } = await catQuery;
      setCategories(cats || []);

      let query = supabase.from('products').select('*, categories(*)');

      if (categorySlug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();
        if (cat) query = query.eq('category_id', cat.id);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'name': query = query.order('name', { ascending: true }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const { data: prods } = await query;
      setProducts(prods || []);
      setLoading(false);
    }
    loadData();
  }, [categorySlug, searchQuery, sortBy]);

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-primary">Products</Link>
        {currentCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">{currentCategory.name}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-3">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/products"
                    className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${!categorySlug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${categorySlug === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {currentCategory ? currentCategory.name : searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{products.length} products found</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
                    <SlidersHorizontal className="w-4 h-4" /> Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Categories</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-1">
                    <Link
                      href="/products"
                      className={`block px-3 py-2 text-sm rounded-md ${!categorySlug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                      All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className={`block px-3 py-2 text-sm rounded-md ${categorySlug === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden sm:flex items-center border rounded-lg">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded-l-lg transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-r-lg transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-secondary animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-secondary rounded animate-pulse" />
                    <div className="h-6 bg-secondary rounded w-1/3 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found</p>
              <Link href="/products">
                <Button variant="outline" className="mt-4">Browse All Products</Button>
              </Link>
            </div>
          ) : (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} listView={view === 'list'} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, listView }) {
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  if (listView) {
    return (
      <Link href={`/products/${product.slug}`}>
        <Card className="group cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-row overflow-hidden">
          <div className="w-32 sm:w-48 shrink-0 relative overflow-hidden bg-gradient-to-br from-secondary to-secondary/30">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-4xl font-bold text-primary/20">{product.name.charAt(0)}</span>
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
            )}
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit mb-2 text-[10px]">{product.categories?.name}</Badge>
            <h3 className="font-semibold group-hover:text-primary transition-colors">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-sm text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-secondary to-secondary/30">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary/30">{product.name.charAt(0)}</span>
              </div>
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-warning text-warning-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Low Stock</span>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{product.categories?.name}</p>
          <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
