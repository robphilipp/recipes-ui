import {MongoClient, MongoClientOptions} from 'mongodb'

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
    replicaSet: 'recipesReplicaSet',
    // useUnifiedTopology: true,
    // useNewUrlParser: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

/**
 * Makes the call to connect the mongo client to the database
 * and returns a promise to the mongo client. This client can
 * then be used freely to make queries against the database.
 * @return A promise to the mongo client
 */
function connectMongoClient(): Promise<MongoClient> {
    // if (!process.env.MONGODB_URI) {
    if (uri === undefined) {
        throw new Error('Please add your Mongo URI to .env.local')
    }
    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri, options)
            global._mongoClientPromise = client.connect()
        }
        return global._mongoClientPromise
        // clientPromise = global._mongoClientPromise
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(uri, options)
        return client.connect()
        // clientPromise = client.connect()
    }
}

/**
 * Attempts to update the {@link clientPromise} with a promise to a
 * new connection to the mongo database. This can be useful when the
 * connection is down, and then comes back up.
 */
export function updateMongoClient(): void {
    clientPromise = connectMongoClient()
}

clientPromise = connectMongoClient()

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
