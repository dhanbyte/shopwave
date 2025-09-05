import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  console.warn('MongoDB URI not found in environment variables')
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'shopwave'

let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

if (uri) {
  const options = {
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 5,
  }
  
  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getDatabase(): Promise<Db> {
  if (!clientPromise) {
    throw new Error('MongoDB connection not initialized')
  }
  try {
    const client = await clientPromise
    return client.db(dbName)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error('Failed to connect to MongoDB')
  }
}

export default clientPromise