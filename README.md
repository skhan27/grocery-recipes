# GroceryApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.10.

# Description

This is an app built to manage your recipes and build shopping lists based on that easily. It is set up for deploying on netlify + firebase along with OpenAI for importing recipes easily. Makes meal planning for the week easier

# Features

- Import recipes by just copying the text or filling out the form
- View individual recipes and get scaled amounts (ex: 2x if you need double the servings)
- Authentication so different users can have their own accounts
- Join household to share your recipes with the other user
- Create a shopping list based on the recipes you intend to make

# Basic set up

- Create a firebase project
- Add auth in firebase
- Set up a netlify site with this repo OR forking this repo
- Get OpenAI api key
- Set up env variables on netlify for the firebase project (see src/environments/environment.ts for the variable names) and openAI (see netlify/functions/openai-proxy.js for the env variable name)
- Deploy should now work
