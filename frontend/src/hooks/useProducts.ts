import { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { PRODUCTS_DATA } from '@/data/products';

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate async loading for consistency
    const loadProducts = () => {
      try {
        setLoading(true);
        setError(null);

        // Filter by category if provided
        let filteredProducts = PRODUCTS_DATA.filter(p => p.isActive);
        if (category) {
          filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        setProducts(filteredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    // Small delay to simulate loading
    setTimeout(loadProducts, 100);
  }, [category]);

  return { products, loading, error };
};

export const useProduct = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = () => {
      console.log('[useProduct] Loading product with slug:', slug);
      try {
        setLoading(true);
        setError(null);

        const foundProduct = PRODUCTS_DATA.find(p => p.slug === slug);

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('[useProduct] Error:', err);
        setError(err instanceof Error ? err.message : 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      // Small delay to simulate loading
      setTimeout(loadProduct, 100);
    } else {
      console.warn('[useProduct] No slug provided');
      setLoading(false);
      setError('No product slug provided');
    }
  }, [slug]);

  return { product, loading, error };
};
