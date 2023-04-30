import Product from "@/models/Product";
import db from "@/utils/db";
import mongoose from "mongoose";

import { getSession } from "next-auth/react";

const getHandler = async (req, res) => {
  db.connect();
  const product = await Product.findById(req.query.id);
  db.disconnect();
  if (product) {
    res.send(product.reviews);
  } else {
    res.status(404).send({ message: "Product not found" });
  }
};

const postHandler = async (req, res, user) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    const existReview = product.reviews.find((x) => x.user == user._id);
    if (existReview) {
      await Product.updateOne(
        { _id: req.query.id, "reviews._id": existReview._id },
        {
          $set: {
            "reviews.$.comment": req.body.comment,
            "reviews.$.rating": Number(req.body.rating),
          },
        }
      );

      const updatedProduct = await Product.findById(req.query.id);
      updatedProduct.numReviews = updatedProduct.reviews.length;
      updatedProduct.rating =
        updatedProduct.reviews.reduce((a, c) => c.rating + a, 0) /
        updatedProduct.reviews.length;
      await updatedProduct.save();

      await db.disconnect();
      return res.send({ message: "Review updated" });
    } else {
      const review = {
        user: new mongoose.Types.ObjectId(user._id),
        name: user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      await product.save();
      await db.disconnect();
      res.status(201).send({
        message: "Review submitted",
      });
    }
  } else {
    await db.disconnect();
    res.status(404).send({ message: "Product Not Found" });
  }
};
const handler = async (req, res) => {
  if (req.method === "GET") {
    return getHandler(req, res);
  } else if (req.method === "POST") {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).send("signin required");
    }
    const { user } = session;
    return postHandler(req, res, user);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

export default handler;
