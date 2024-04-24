# Component Tracker
A web application to track the wear and tear of your favorite bicycle components.

## Project Layout
This application is built using a MEAN stack employing **M**ongoDB, **E**xpressJS, **A**ngular and **N**odeJS. The following folders can be found in the root:

- `server` - The backend server written with NodeJS using ExpressJS.

- `component-tracker-app` - A front end web client written in Angular

## Build
The following section describes how to build and run the project.

### Install the toolchain
This applcation requires NodeJS. Install [NodeJS](https://nodejs.org/en/download) for your development platform according to the instructions on the site.

The server uses the `yarn` package manager, which comes pre-installed with NodeJS, however, it must first be enabled. [To enable yarn](https://yarnpkg.com/getting-started/install), open a terminal window and type the following:

```
$ corepack enable
```

We recommend installing [Visual Studio Code](https://code.visualstudio.com/download) to work with the source files.

### Install MongoDB
The server uses MongoDB to store data. We recommended that MongoDB be installed directly on the development machine for convienence. Installation instructions can be found on the [MongoDB site](https://www.mongodb.com/docs/manual/administration/install-community/).

Note that you can also use docker or MongoDB's cloud service called Atlas. However, a local installation gives the developer access to tools for working with the data.

### Create Google App
The application uses third party social media apps for managing user login and authentication. Specifically, we use Google logins. To enable user logins, you must create a Google App that you can reference in your server. Head to your Google Cloud Console to create an app using the following link: 

https://console.cloud.google.com/apis/credentials

Click the `Create Credentials` button and select Oauth Client ID. The Application Type is a Web Application. Give your application a name and add the following urls to the indicated fields.

- Authorized Javascript Origin: `http://localhost:3000`
- Authorized Redirect Urls: `http://localhost:3000/auth/google/callback`

Once the app is created, you will have a Client ID and a Client Secret that you will need later.

### Create Strava App
To enable users to import their data from Strava, you need to create a client app for Strava. Head to Strava's API site to create your app using the following link:

https://www.strava.com/settings/api

When creating your Strava App, use `localhost` for the Website field and use `localhost` for the Authorized Callback Domain.

Once the app is created, you will have a Client ID and a Client Secret that you will need later.

### Configure your environment file
The server app uses environment variables to store sensitive data. As a convienence for developers, we use a dotenv file (`.env`) to populate and inject these variables. The `.env` file should never be committed to source code.

There is a sample `.env` file checked into source called `.env.example`. Copy this file and rename it to `.env` and make sure it is present in the root of the `server` folder. Using the Client IDs and Client Secrets for the OAuth apps created, fill in the required environment variables. 

For the `SESSION_SECRET` environment variable, you can create any random string.

Below is a copy of the example dotenv file:

```
PORT=3000
CORS_ORIGINS='http://localhost:4200'
CONNECTION_STRING=mongodb://localhost:27017/component-tracker
SESSION_SECRET=CREATE_A_RANDOM_STRING
GOOGLE_CLIENT_ID=YOUR_GOOGLE_APP_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_APP_CLIENT_SECRET
STRAVA_CLIENT_ID=YOUR_STAVA_APP_CLIENT_ID
STRAVA_CLIENT_SECRET=YOUR_STAVA_APP_CLIENT_SECRET
```

### Run the server
To run the server, simply execute NodeJS with the server file. Open a terminal and change to the server directory and execute the following:

```
$ node ./server.js
```

>Note: If you want to debug the server, you can use the launch configuration available in VS Code.

### Run the Angular Client
The client is an Angular project. You can use the standard command `ng serve` to run the development server that automatically saves and redeploys updates. Open a terminal and change to the `component-tracker-app` directory and execute the following:

```
$ npm run serve
```

> Note: You can also use `ng serve` directly if you have previously installed the Angular CLI tool.

> Note: For more information on Angular, please read https://angular.io/start and try the tutorials at https://angular.io/tutorial
