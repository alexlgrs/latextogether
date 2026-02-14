import mongoose from "mongoose";
  import dns from 'node:dns';

export const connectDB = async () => {
  dns.setDefaultResultOrder('ipv4first'); // Force la résolution IPv4 avant IPv6
  dns.setServers(["1.1.1.1"]);

  try {
    console.log(process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté");
  } catch (error) {
    console.error("Erreur MongoDB", error);
    process.exit(1);
  }
};
