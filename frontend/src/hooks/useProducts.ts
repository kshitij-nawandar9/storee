import { useState, useEffect } from 'react';
import { getProducts, getProductBySlug } from '@/services/api';
import type { Product } from '@/types';

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProducts(category);
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
};

export const useProduct = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      console.log('[useProduct] Fetching product with slug:', slug);
      try {
        setLoading(true);
        setError(null);
        const response = await getProductBySlug(slug);
        console.log('[useProduct] Response:', response);
        if (response.success) {
          setProduct(response.data);
        } else {
          setError(response.message || 'Product not found');
        }
      } catch (err) {
        console.error('[useProduct] Error:', err);
        setError(err instanceof Error ? err.message : 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    } else {
      console.warn('[useProduct] No slug provided');
      setLoading(false);
      setError('No product slug provided');
    }
  }, [slug]);

  return { product, loading, error };
};
