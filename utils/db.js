import mongoose from "mongoose";

const connection = {};

async function connect() {
  if (connection.isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

async function disconnect() {
  if (!connection.isConnected) {
    console.log("Not connected to MongoDB");
    return;
  }

  try {
    if (process.env.NODE_ENV === "production") {
      await mongoose.disconnect();
      connection.isConnected = false;
      console.log("Disconnected from MongoDB");
    } else {
      console.log("Not disconnected from MongoDB (development mode)");
    }
  } catch (error) {
    console.error("Error disconnecting from MongoDB", error);
  }
}

function convertDocToObj(doc) {
  let convertedDoc = doc;
  if (doc instanceof mongoose.Document) {
    convertedDoc = doc.toObject();
  }
  convertedDoc._id = convertedDoc._id.toString();
  convertedDoc.createdAt = convertedDoc.createdAt.toString();
  convertedDoc.updatedAt = convertedDoc.updatedAt.toString();
  return convertedDoc;
}

const db = {
  connect,
  disconnect,
  convertDocToObj,
};

export default db;
