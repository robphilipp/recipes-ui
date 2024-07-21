import {MongoClient, MongoClientOptions} from 'mongodb'
import {Logger} from "tslog";

const logger = new Logger({name: "mongo-client"})

const uri = process.env.MONGODB_URI
const replicaSet = process.env.MONGODB_REPLICA_SET
const options: MongoClientOptions = {
    replicaSet,
    // useUnifiedTopology: true,
    // useNewUrlParser: true,
}

logger.debug(`mongo-uri: ${uri}; mongo-replica-set: ${replicaSet}; node-env: ${process.env.NODE_ENV}; options: ${JSON.stringify(options, null, 2)}`)

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
            logger.debug(`mongo-client-promise has not yet been created, creating a new mongo client`)
            client = new MongoClient(uri, options)
            logger.info(`created a new mongo client; uri: ${uri}; mongo-replica-set: ${replicaSet}; options: ${JSON.stringify(options, null, 2)}`)
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
