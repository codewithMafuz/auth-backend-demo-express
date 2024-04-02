import mongoose from 'mongoose'


const connectDB = async (DB_CONNECTION_STRING, DB_OPTIONS = {}) => {
    try {
        const connectDB = await mongoose.connect(DB_CONNECTION_STRING, {
            ...DB_OPTIONS
        })
        // console.log("Successfully connected Database with ;\n")
    } catch (error) {
        // console.log("Error in connecting database ;\n", error)
    }
}

export default connectDB