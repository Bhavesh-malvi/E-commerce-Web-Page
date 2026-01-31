import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../components/common/Toast';
import ProductForm from '../../components/Seller/ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const { getSingleProduct } = useContext(AppContext);
  const toast = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const res = await getSingleProduct(id);
    if (res?.success) {
      setProduct(res.product);
    } else {
      toast.error('Failed to fetch product details');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Edit Product
        </h1>
        <p className="text-gray-600 mt-1">Update product details</p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
};

export default EditProduct;
