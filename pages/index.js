import Layout from "@/components/Layout";
import ProductItem from "@/components/ProductItem";
import SkeletonLoader from "@/components/SkeletonLoader";
import Product from "@/models/Product";
import db from "@/utils/db";
import { Store } from "@/utils/Store";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home({ topRatedProducts, error }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [loading, setLoading] = useState(true);
  const loaderCount = 5;
  const loaderArray = Array.from({ length: loaderCount });
  const addCartHandler = async (product) => {
    const existItem = cart.cartItems.find((item) => item.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock");
      return;
    }

    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    toast.success("Product added to the cart");
  };

  useEffect(() => {
    if (!topRatedProducts && !error) {
      setLoading(true);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // set a delay of 1 second before changing the loading state to false
      return () => clearTimeout(timer);
    }
  }, [topRatedProducts, error]);

  return (
    <>
      <Layout title="Home Page">
        <h2 className="my-3 text-2xl">Products</h2>
        {topRatedProducts.length === 0 && !error && <div>No Product Found</div>}
        {topRatedProducts.length === 0 && error && (
          <p>Error loading products</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loading &&
            loaderArray.map((_, index) => <SkeletonLoader key={index} />)}
          {!loading &&
            topRatedProducts.map((product) => (
              <ProductItem
                key={product._id}
                product={product}
                addToCartHandler={addCartHandler}
              />
            ))}
        </div>
      </Layout>
    </>
  );
}
export async function getServerSideProps() {
  await db.connect();
  const topRatedProductsDocs = await Product.find({}, "-reviews").lean().sort({
    rating: -1,
  });
  await db.disconnect();
  return {
    props: {
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
    },
  };
}
