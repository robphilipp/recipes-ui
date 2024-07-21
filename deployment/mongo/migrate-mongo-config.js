// In this file you can configure migrate-mongo

const mongoUser = process.env.MONGO_ADMIN_USERNAME
const mongoPassword = process.env.MONGO_ADMIN_PASSWORD
// todo once the deploy_recipes_mongo_with_auth.sh URL encodes the password, then use
//      below, rather than above
// const mongoPassword = encodeURIComponent(process.env.MONGO_ADMIN_PASSWORD)
const mongoNodes = process.env.MONGO_NODES
const replicaSet = process.env.MONGODB_REPLICA_SET
const databaseName = process.env.MONGODB_DATABASE_NAME

const config = {
  mongodb: {
    url: `mongodb://${mongoUser}:${mongoPassword}@${mongoNodes}/?replicaSet=${replicaSet}&authSource=admin`,
    databaseName: databaseName,

    options: {}
  },

  // The migrations dir, can be a relative or absolute path. Only edit this
  // when really necessary.
  migrationsDir: "/usr/app/dbmigrations/migrations",

  // The mongodb collection where the applied changes are stored. Only edit
  // this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir 
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use
  // that in the comparison to determine if the file should be run.  Requires
  // that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'esm',
};

// Return the config as a promise
module.exports = config;
