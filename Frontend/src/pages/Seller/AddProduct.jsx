import React from 'react';
import ProductForm from '../../components/Seller/ProductForm';

const AddProduct = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Add New Product
        </h1>
        <p className="text-gray-600 mt-1">Fill in the details to list a new product</p>
      </div>

      <ProductForm />
    </div>
  );
};

export default AddProduct;
