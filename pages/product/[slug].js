import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

import { useForm } from "react-hook-form";
import { Store } from "@/utils/Store";
import { getError } from "@/utils/error";
import Layout from "@/components/Layout";
import Image from "next/legacy/image";
import Rating from "@/components/Rating";
import Product from "@/models/Product";
import db from "@/utils/db";

export default function ProductScreen(props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { product } = props;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchReviews = useCallback(async () => {
    try {
      if (!product) {
        return;
      }
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
    } catch (err) {
      toast.error(getError(err));
    }
  }, [product]);

  const submitHandler = async ({ rating, comment }) => {
    setLoading(true);
    try {
      await axios.post(`/api/products/${product._id}/reviews`, {
        rating,
        comment,
      });
      setLoading(false);
      toast.success("Review submitted successfully");
      fetchReviews();
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  if (!product) {
    return (
      <Layout>
        <h3 className="text-center">404 : Product Not Found</h3>
      </Layout>
    );
  }
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };

  return (
    <Layout title={product.name}>
      <div className="py-2">
        <Link href="/">back to products</Link>
      </div>
      <div className="grid md:grid-cols-4 md:gap-3">
        <div className="md:col-span-2">
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            layout="responsive"
          ></Image>
        </div>
        <div>
          <ul>
            <li>
              <h1 className="text-lg">{product.name}</h1>
            </li>
            <li>Category: {product.category}</li>
            <li>Brand: {product.brand}</li>
            <li>
              <Rating rating={product.rating} numReviews={product.numReviews} />
            </li>
            <li>Description: {product.description}</li>
          </ul>
        </div>
        <div>
          <div className="card p-5">
            <div className="mb-2 flex justify-between">
              <div>Price</div>
              <div>${product.price}</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>Status</div>
              <div>{product.countInStock > 0 ? "In stock" : "Unavailable"}</div>
            </div>
            <button
              className="primary-button w-full"
              onClick={addToCartHandler}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <div id="reviews" className="max-w-screen-md">
        <h2 className="mt-3 text-lg">Customer Reviews</h2>
        {reviews.length === 0 && <div>No review found</div>}
        <ul>
          {reviews.map((review) => (
            <li key={review._id}>
              <div className="mt-3 p-3 shadow-inner dark:shadow-gray-700">
                <div>
                  <strong>{review.name}</strong> on{" "}
                  {review.createdAt.substring(0, 10)}
                </div>
                <Rating rating={review.rating}></Rating>
                <div>{review.comment}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="card mt-5  p-5">
          {session ? (
            <form onSubmit={handleSubmit(submitHandler)}>
              <h2 className="mb-4 text-lg">Leave your review</h2>
              <div className="mb-4">
                <label htmlFor="comment">Comment</label>
                <textarea
                  className="w-full"
                  id="comment"
                  {...register("comment", {
                    required: "Please enter comment",
                  })}
                />
                {errors.comment && (
                  <div className="text-red-500">{errors.comment.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  className="w-full"
                  {...register("rating", {
                    required: "Please enter rating",
                  })}
                >
                  <option value=""></option>
                  {["1 star", "2 stars", "3 stars", "4 stars", "5 stars"].map(
                    (x, index) => (
                      <option key={index + 1} value={index + 1}>
                        {x}
                      </option>
                    )
                  )}
                </select>
                {errors.rating && (
                  <div className="text-red-500 ">{errors.rating.message}</div>
                )}
              </div>
              <div className="mb-4 ">
                <button disabled={loading} className="primary-button">
                  {loading ? "Loading" : "Submit"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              Please{" "}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                login
              </Link>{" "}
              to write a review
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }, "-reviews").lean();
  await db.disconnect();
  return {
    props: {
      product: product ? db.convertDocToObj(product) : null,
    },
  };
}
