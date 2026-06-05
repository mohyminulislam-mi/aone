'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { productAPI } from '@/services/api';
import { normalizeCategories } from '@/lib/api-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewProductPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    image_url: '',
    category_id: '',
    featured: false,
    stock: '0',
  });

  useEffect(() => {
    if (!authLoading && (!user || !profile?.is_admin)) router.push('/');
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    productAPI
      .getCategories()
      .then((response) => setCategories(normalizeCategories(response)))
      .catch(() => setCategories([]));
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'name' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productAPI.createProduct({
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        image_url: form.image_url || null,
        category_id: form.category_id,
        featured: form.featured,
        stock: parseInt(form.stock),
      });
      toast.success('Product created successfully');
      router.push('/admin');
    } catch (err) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || (!user || !profile?.is_admin)) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => updateForm('description', e.target.value)} className="mt-1" rows={3} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => updateForm('price', e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="compare_at_price">Compare at Price ($)</Label>
                <Input id="compare_at_price" type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => updateForm('compare_at_price', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select value={form.category_id} onValueChange={(val) => updateForm('category_id', val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" type="url" value={form.image_url} onChange={(e) => updateForm('image_url', e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => updateForm('stock', e.target.value)} className="mt-1" />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <Switch checked={form.featured} onCheckedChange={(val) => updateForm('featured', val)} />
                <Label>Featured Product</Label>
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? 'Creating...' : 'Create Product'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
