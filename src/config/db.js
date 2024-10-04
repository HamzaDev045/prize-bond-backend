import mongoose from 'mongoose';
//tesst
async function connect() {
    try {
        let url;
        if (process.env.NODE_ENV === 'production') {
            url = process.env.mongoConnectivityString;
        } else {
<<<<<<< HEAD
            
            // url =
            //   "mongodb+srv://hamza:DPfDCRud4niLTyT9@cluster0.ykykt2i.mongodb.net/number-system";
            url = `mongodb+srv://hamza:WrzfcEaCGzsqbyNi@cluster0.ykykt2i.mongodb.net/number-system`;
            // url = process.env.mongoConnectivityString;
=======

            url =
              "mongodb+srv://hamza:ycFBBZs8korSSjPA@cluster0.ykykt2i.mongodb.net/number-system";
    
>>>>>>> hamza-dev
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
