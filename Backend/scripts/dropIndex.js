import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env vars
dotenv.config();

// Connect and drop index
const dropIndex = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected!");

        const collection = mongoose.connection.collection("deals");
        
        // List indexes to verify
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes);

        // Drop the problematic index
        // The error said: E11000 duplicate key error collection: test.deals index: product_1 dup key: { product: null }
        // So index name is likely 'product_1'
        
        try {
            await collection.dropIndex("product_1");
            console.log("Successfully dropped index 'product_1'");
        } catch (err) {
            console.log("Could not drop index 'product_1' (maybe it doesn't exist?):", err.message);
        }

        console.log("Done!");
        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

dropIndex();
