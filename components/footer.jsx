import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const categories = [
    { name: 'Car Engine Oils', href: '/products?category=car-engine-oils' },
    { name: 'Motorcycle Oils', href: '/products?category=motorcycle-oils' },
    { name: 'Bus & Truck Oils', href: '/products?category=bus-truck-oils' },
    { name: 'Vehicle Care', href: '/products?category=vehicle-care' },
    { name: 'Industrial Lubricants', href: '/products?category=industrial-lubricants' },
  ];

  return (
    <footer className="bg-foreground text-background/90">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">
                Mobil<span className="text-primary">Store</span>
              </span>
            </Link>
            <p className="text-sm text-background/60 leading-relaxed mb-4">
              Premium lubricants and engine oils designed with immaculate engineering to ensure excellent performance of your vehicle.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={cat.href} className="text-sm text-background/60 hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-background/60 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/orders" className="text-sm text-background/60 hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/account" className="text-sm text-background/60 hover:text-primary transition-colors">My Account</Link></li>
              <li><Link href="/shipping" className="text-sm text-background/60 hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-sm text-background/60 hover:text-primary transition-colors">Returns Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/60">
                <Phone className="w-4 h-4 shrink-0" /> 1-800-MOBIL-OIL
              </li>
              <li className="flex items-center gap-2 text-sm text-background/60">
                <Mail className="w-4 h-4 shrink-0" /> support@mobilstore.com
              </li>
              <li className="flex items-start gap-2 text-sm text-background/60">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> 123 Lubricant Ave, Houston, TX 77001
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} MobilStore. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-background/40 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-background/40 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
