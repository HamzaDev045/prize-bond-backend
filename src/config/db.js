import mongoose from 'mongoose';

async function connect() {
    try {
        let url;
        if (process.env.NODE_ENV === 'production') {
            url = process.env.mongoConnectivityString;
        } else {

            url =
              "mongodb+srv://hamza:ycFBBZs8korSSjPA@cluster0.ykykt2i.mongodb.net/number-system";
    
        }

        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

export default connect
