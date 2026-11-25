import mongoose from 'mongoose';
import dns from 'dns';

// Ensure SRV DNS resolution works reliably across all network environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.log('DNS setServers notice:', e.message);
}

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    return;
  }

  // dbName sets the database explicitly, so it works whether or not
  // the URI already contains a database name.
  await mongoose.connect(uri, { dbName: 'e-commerce' });
};

export default connectDB;