'use client';

import { useEffect, useState } from 'react';
import { productAPI } from '@/services/api';
import { normalizeCategories } from '@/lib/api-data';

export function useCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;

    productAPI
      .getCategories()
      .then((response) => {
        if (active) setCategories(normalizeCategories(response));
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return categories;
}
