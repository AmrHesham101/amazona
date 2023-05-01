import Product from "@/models/Product";
import User from "@/models/User";
import data from "@/utils/data";
import db from "@/utils/db";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || (session && !session.user.isAdmin)) {
    return res.status(401).send("signin required");
  }
  await db.connect();
  await Product.deleteMany();
  await Product.insertMany(data.products);
  await User.deleteMany();
  await User.insertMany(data.users);
  await db.disconnect();
  res.send({ message: "seeded succefully" });
}
