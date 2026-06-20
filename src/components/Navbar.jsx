"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const [menus, setMenus] = useState([]); // API থেকে আসা ক্যাটাগরি রাখার স্টেট
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const pathname = usePathname();

  /* Active check: exact match for "/", prefix match for the rest */
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

// API থেকে ক্যাটাগরি ফেচ করে স্লাগসহ লিংক তৈরি
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/categories");
      const data = await res.json();
      
      // এখানে data.categories নিশ্চিত করা হয়েছে কারণ আপনার API রেসপন্সে অবজেক্ট আসছে
      const categoryList = data.categories || [];
      
      const formattedMenus = [
        { name: "Home", href: "/" },
        ...categoryList.map((cat) => ({
          name: cat.name,
          href: `/products?category=${cat.slug}`, 
        })),
      ];
      
      setMenus(formattedMenus);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  fetchCategories();
}, []);

  // স্ক্রোল হ্যান্ডলার
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentY - lastScrollY.current;

          if (Math.abs(diff) < 8) {
            ticking.current = false;
            return;
          }

          if (diff > 0 && currentY > 80) {
            setShowNavbar(false);
          } else {
            setShowNavbar(true);
          }

          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* main nav wrapper (শুধুমাত্র ডেসকটপে দেখাবে) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: showNavbar ? 0 : -100 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="hidden lg:block fixed top-0 left-0 w-full z-40 will-change-transform shadow-md"
      >
        <div className="bg-[#0B3D2E] mt-16 lg:mt-18">
          <nav className="bg-[#F3F8F4] border-b border-[#DCEADE]">
            {/* ডাইনামিক গ্রিড কলাম */}
            <div 
              className="max-w-screen-xl mx-auto grid h-14"
              style={{ gridTemplateColumns: `repeat(${menus.length || 1}, minmax(0, 1fr))` }}
            >
              {menus.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href} // স্লাগ সহ ডাইনামিক লিংক এখানে কাজ করবে
                    className={`
                      flex flex-col items-center justify-center relative group transition-all
                      ${
                        active
                          ? " text-[#0B5D3B]"
                          : "text-[#10231B] hover:bg-[#E0F2E7]"
                      }
                    `}
                  >
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mt-1 ${
                        active ? "text-[#0B5D3B]" : ""
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Active indicator bar */}
                    {active ? (
                      <motion.div
                        layoutId="active-bar"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0B5D3B]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    ) : (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0B3D2E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </motion.div>

      {/* spacer */}
      <div className="hidden lg:block h-14" />
    </>
  );
}