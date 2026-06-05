'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { adminAPI, orderAPI, productAPI } from '@/services/api';
import { normalizeOrders, normalizeProducts, oneFrom } from '@/lib/api-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !profile?.is_admin)) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (!user || !profile?.is_admin) return;
    async function loadData() {
      try {
        const [ordersRes, productsRes, usersRes, statsRes] = await Promise.all([
          orderAPI.getAllOrders(),
          productAPI.getProducts({ sort: 'newest' }),
          adminAPI.getUsers(),
          adminAPI.getStats().catch(() => null),
        ]);

        const allOrders = normalizeOrders(ordersRes);
        const allProducts = normalizeProducts(productsRes);
        const allUsers = Array.isArray(usersRes) ? usersRes : usersRes?.users || usersRes?.data || [];
        const apiStats = statsRes ? oneFrom(statsRes, ['stats']) : null;
        const revenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

        setOrders(allOrders);
        setProducts(allProducts);
        setStats({
          revenue: Number(apiStats?.revenue ?? revenue),
          orders: Number(apiStats?.orders ?? allOrders.length),
          products: Number(apiStats?.products ?? allProducts.length),
          users: Number(apiStats?.users ?? allUsers.length),
        });
      } catch (_error) {
        setOrders([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, profile]);

  async function updateOrderStatus(orderId, newStatus) {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success('Order status updated');
    } catch (_error) {
      toast.error('Failed to update order status');
    }
  }

  if (authLoading || (user && !profile?.is_admin)) return null;
  if (!user) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 bg-secondary animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your store</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">Add Product</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'text-green-600' },
          { icon: ShoppingCart, label: 'Orders', value: stats.orders, color: 'text-blue-600' },
          { icon: Package, label: 'Products', value: stats.products, color: 'text-orange-600' },
          { icon: Users, label: 'Users', value: stats.users, color: 'text-purple-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.profiles?.full_name || 'N/A'}</TableCell>
                        <TableCell>{order.order_items?.length || 0} items</TableCell>
                        <TableCell className="font-bold">${parseFloat(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status] || ''} variant="secondary">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(val) => updateOrderStatus(order.id, val)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Package className="w-5 h-5" /> Products</span>
                <Link href="/admin/products/new">
                  <Button size="sm">Add Product</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No products yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Featured</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.categories?.name}</TableCell>
                        <TableCell>${parseFloat(p.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={p.stock <= 5 ? 'destructive' : 'secondary'}>
                            {p.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.featured ? 'default' : 'outline'}>
                            {p.featured ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
