import { MongoClient } from 'mongodb';
import 'dotenv/config'

const dbName = process.env.DB_NAME;
const dbUrl = process.env.MONGO_URI;

const client = new MongoClient(`${dbUrl}/${dbName}`, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log('MongoDB Connected');

  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};


function getDB() {
  return client.db(dbName)
}


export {
  connectDB,
  getDB
};
