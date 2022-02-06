# recipes

Basic recipe book for cooking great things.

## contributing

The recipe book app uses mongodb to store the recipes. You'll want to set up or point to a mongo database.

### setting up mongo db

On macOS with homebrew

Install `mongodb`
```shell
brew tap mongodb/brew
brew install mongodb-community@5.0
```

Start `mongodb` with
```shell
brew services start mongodb-community@5.0
```

Stop `mongodb` with
```shell
brew services stop mongodb-community@5.0
```

This project uses [migrate-mongo](https://www.npmjs.com/package/migrate-mongo) to set up the recipe collection in mongoDB and to migrate changes to the schema and data. To get going, install `migrate-mongo`.

```shell
npm install -g migrate-mongo
```

Then from the `dbmigrations` directory, run
```shell
migrate-mongo up
```

This will create the `recipes` collection and its validation schema. Now you can add recipes using the UI, or use the sample queries provided in [docs/mongo-schema.md](./docs/mongo-schema.md) after the example schema definition.

### adding the collection and schema validation
Using `mongosh` or some other tool, create the `recipeBook` database with the `use recipeBook` command. Then create the `recipes` collection with the schema validator.

See [mongo-schema.md](./docs/mongo-schema.md) for the schema and a few example recipes insert commands.

### database migrations

This project uses [migrate-mongo](https://www.npmjs.com/package/migrate-mongo) to manage the mongo database and apply and rollback changes. Also see [All you need to know about MongoDB schema migrations in node.js](https://softwareontheroad.com/database-migration-node-mongo/#migration-tool-init) for a nice write-up for using `migrate-mongo`.

In the `dbmigrations` directory,

```shell
migrate-mongo create <create some_description_of_changes>
```

This will create a migration file in the `dbmigrations/migrations` directory, to which you can add the migration. Then to apply the migration

```shell
migrate-mongo up
```

And to revert to the prvious version

```shell
migrate-mongo down
```


## raspberry π for recipes

For raspberry π 4b use the 64-bit debian images from [raspberry pi](https://downloads.raspberrypi.org/raspios_arm64/images)

Use the [set up docs](https://www.raspberrypi.com/documentation/computers/getting-started.html) as a base.

The [Raspberry Pi Imager](https://www.raspberrypi.com/software) can be used to image the downloaded image. Just select the "Use Custom" option from the main menu when selecting the operating system.

### setting up mongodb

[binaries and instructions for 4.4.8](https://andyfelong.com/2021/08/mongodb-4-4-under-raspberry-pi-os-64-bit-raspbian64/#more-1797)

Once installed, you can start the mongo database with:

```shell
sudo systemctl start mongodb
```

To see the status of the service:
```shell
sudo systemctl status mongodb
```

To stop the service:
```shell
sudo systemctl stop mongodb
```

To enable the service to start automatically at boot:
```shell
sudo systemctl enable mongodb
```

### pm2 (process manager)

```shell
npm install pm2@latest -g
```

To start with `pm2`, in the nextjs project directory, after running

```shell
npm run build
```

in the same directory, run

```shell
pm2 start npm --name "recipes" -- start -- -p 8080
```

Once started,  you can get the status, stop, start, remove the process from any directory:

```shell
 $ pm2 delete 4
[PM2] Applying action deleteProcessId on app [4](ids: [ '4' ])
[PM2] [nextapp](4) ✓
┌─────┬────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name       │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 6   │ recipes    │ default     │ N/A     │ fork    │ 16125    │ 4m     │ 0    │ online    │ 0%       │ 53.9mb   │ pi       │ disabled │
└─────┴────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

```shell
pm2 stop <id>
pm2 start <id>
pm2 delete <id>
```

For more details about the process:

```shell
pm2 show recipes
```

To have `pm2` maintain the list of processes and start-up when the server restarts see the [pm2 persistent application docs](https://pm2.keymetrics.io/docs/usage/startup/).

### setting up nginx

> A good starting point is [nginx beginners guide](https://nginx.org/en/docs/beginners_guide.html) and [nginx reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

On debian (works on `raspian`) use `apt` and the default debian repository

```shell
sudo apt update
sudo apt install nginx
```

To verify that `nginx` has been installed properly, show it's version

```shell
sudo nginx -version
```

Then edit the `/etc/nginx/nginx.conf` file.

```conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}

http {
    server {
        # all incoming request on port 80 (listen 80 is the default value and is omitted here)
        # get mapped to localhost:8080 on which the recipes are running
        location / {
            proxy_pass http://localhost:8080/;
        }
    }
}
```

Now start `nginx`

```shell
sudo nginx
```

> Some useful commands: `sudo nginx -s reload`, `sudo nginx -s stop`.

This should already have set up `nginx` as a service. You can verify this with

```shell
systemctl status nginx
```

And you should be good to go.
