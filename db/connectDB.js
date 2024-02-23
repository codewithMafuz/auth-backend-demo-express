import mongoose from 'mongoose'

const connectDB = (DB_CONNECTION_STRING) => {
    try {
        mongoose.connect(DB_CONNECTION_STRING)
            .then((val) => {
                console.log("Successful Connected to -", {
                    user: val.connection.user,
                    dbName: val.connection.name
                },
                    "========================================================================================")
            })
    } catch (err) {
        console.log(err);
    }
}

export default connectDB