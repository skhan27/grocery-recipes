const fs = require("fs");
const path = require("path");

const environmentFilePath = path.join(
  __dirname,
  "src",
  "environments",
  "environment.ts"
);
const envConfigFile = `
  export const environment = {
    production: true,
    apiUrl: "/api",
    firebaseConfig: {
      apiKey: '${process.env.FIREBASE_API_KEY}',
      authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
      databaseURL: '${process.env.FIREBASE_DATABASE_URL}',
      projectId: '${process.env.FIREBASE_PROJECT_ID}',
      storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
      messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
      appId: '${process.env.FIREBASE_APP_ID}',
      measurementId: '${process.env.FIREBASE_MEASUREMENT_ID}'
    }
  };
`;

fs.writeFileSync(environmentFilePath, envConfigFile);
