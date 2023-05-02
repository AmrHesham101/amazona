/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React from "react";
import Rating from "./Rating";

export default function ProductItem({ product, addToCartHandler }) {
  return (
    <div className="card">
      <Link href={`/product/${product.slug}`}>
        <img
          src={product.image}
          alt={product.name}
          className="rounded shadow object-cover h-auto w-full"
        />
      </Link>
      <div className="flex flex-col items-center justify-center p-5">
        <Link href={`/product/${product.slug}`}>
          <h2 className="text-lg">{product.name}</h2>
        </Link>
        {<Rating rating={product.rating} />}
        <p className="mb-2">{product.brand}</p>
        <p>${product.price}</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => addToCartHandler(product)}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
