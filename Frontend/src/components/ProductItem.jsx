import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';

// Ask Cloudinary for an optimised (auto format/quality, capped width) version of the image.
// Non-Cloudinary URLs are returned untouched.
const optimize = (url = '', width = 500) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/f_auto')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
    : url;

export const ProductSkeleton = () => (
  <div className='animate-pulse'>
    <div className='w-full aspect-[3/4] bg-gray-200' />
    <div className='h-3 bg-gray-200 rounded mt-3 w-3/4' />
    <div className='h-3 bg-gray-200 rounded mt-2 w-1/4' />
  </div>
);

const ProductItem = ({id,image,name,price,eager=false}) => {

  const {currency} = useContext(ShopContext);
  const src = optimize(Array.isArray(image) ? (image[0] || '') : (image || ''));

  return (
   <Link className='text-gray-700 cursor-pointer'  to={`/product/${id}`}>
      <div className='overflow-hidden bg-gray-100'>
         <img
           className='hover:scale-110 transition ease-in-out w-full h-auto object-cover'
           src={src}
           alt={name}
           loading={eager ? 'eager' : 'lazy'}
           decoding='async'
         />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className=' text-sm font-medium'>{currency}{price}</p>
   </Link >
  )
}

export default ProductItem