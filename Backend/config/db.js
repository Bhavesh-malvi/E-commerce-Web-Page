import mongoose from "mongoose";



let isConnected = false;

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB already connected');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        
        isConnected = db.connections[0].readyState;

        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;