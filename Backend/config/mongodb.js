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

  // Handle URI formatting so /e-commerce is placed before query parameters
  let connectionUrl = uri;
  if (uri.includes('?')) {
    const [base, query] = uri.split('?');
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    connectionUrl = `${cleanBase}/e-commerce?${query}`;
  } else {
    const cleanBase = uri.endsWith('/') ? uri.slice(0, -1) : uri;
    connectionUrl = `${cleanBase}/e-commerce`;
  }

  await mongoose.connect(connectionUrl);
};

export default connectDB;
