# Hourly

This is a web application to allow students to sign up for office hours and see the number of the students anticipated at a given session. It will also allow for course staff to create office hours and update them on a shared schedule with the students.

**Team**

| Name                | JHU Email        | GitHub Username |
| ------------------- | ---------------- | --------------- |
| Alex Wei            | awei11@jhu.edu   | alexcjwei       |
| Sam Ertman          | sertman1@jhu.edu | sertman1        |
| Chiamaka Anaemeribe | canaeme1@jhu.edu | Anaemeribe      |
| Samuel Atefah       | satefah1@jhu.edu | samuelatefah    |
| Christopher Wilhelm | cwilhel8@jhu.edu | ChrisWilhelm    |
| Varun Harish        | vharish1@jhu.edu | varun-harish    |

**Advisors**

| Name         | JHU Email      | GitHub Username |
| ------------ | -------------- | --------------- |
| Gurion Marks | gurion@jhu.edu | gurion          |

## Documentation

- [Project Document](https://docs.google.com/document/d/1k2emc3oooeV-LCNw0Mr5xQEa7y3r_cCDhHu9XRSoZno/edit?usp=sharing)
- [User Manual](https://cs421sp22-homework.github.io/project-team-04-vasscc/)
- [API Documentation](https://cs421sp22-homework.github.io/project-team-04-vasscc/api.html)

## Installing / Getting started

Clone the repository to your machine. `cd` to the directory you want the repository to live then

```shell
git clone https://github.com/cs421sp22-homework/project-team-04-vasscc.git
```

Then install node packages in the `code`, `frontend`, and `backend` directories.

```shell
cd project-team-04-vasscc/code && npm i
cd backend && npm i
cd ../frontend && npm i
```

## Developing

First, read [CONTRIBUTING.md](CONTRIBUTING.md).

You'll need to get the `config.env` file to connect to PostgresSQL. Put it in the `code/backend/config` directory. Do not push to GitHub.
`config.env` should have the `ATLAS_URI`, `PORT`, `JWT_SECRET`, and `NODE_ENV` defined.
For development purposes, you can set `JWT_SECRET=secret` and `NODE_ENV=development`.

You will also need to have a `.env` file to be able to successfully run the frontend locally. Put it in the `code/frontend` directory. Do not push to GitHub. The `.env` file should include 

`REACT_APP_BASE_URL=http://localhost:PORT`

`PORT` should be replaced with the port number in which you like to run locally.

### Connecting to PostgresSQL

First, get the following parameters for your postgres database: `POSTGRES_URI`, `PGUSER`, `PGHOST`, `PGPASSWORD`, `PGDATABASE`, and `PGPORT` from a developer. Paste these parameters and their values in the `config.env` file in the `code/backend/config` directory. Make sure this file is ignored by git for security.

To create your own matching database, run the schema.sql script from the config file on your postgres data base. Then, run the storedProcedures.sql
script to import the functions needed for running the backend. These can be set up on heroku using their database platform, and can be accessed via
the heroku cli and postgres command line application.

### Email notifications

To allow for email notifications when running the app locally, please add `GMAIL_USER` and `GMAIL_PASS` parameters and their values to the `config.env` file in the `code/backend/config/` directory. 

You can create a gmail account and use the email address as the value for `GMAIL_USER` and the password as the value for `GMAIL_PASS`.

### Running the application locally

These are the steps to follow to run the application locally:

1. `cd` to `code/frontend` and build the static files `npm run build`.
2. `cd` to `code/backend` and start the server with `npm run dev`.

Then, navigate to [http://localhost:5000](http://localhost:5000) or whatever port the server is running on to view the the React app served from Express.

Alternatively, you can just run the frontend by navigating to `code/frontend` and

```shell
npm run start
```

The app should deploy to Heroku after pushes to `main`. Please do not push directly to `main`!

### Testing

Jest and Supertest are being used. `cd` to `code/backend/tests` to add tests. To run tests, `cd` to `code/backend` and `npm run test`.

### Deployment

The app should deploy to Heroku after pushes to `main`. Please do not push directly to `main`!
The app will automatically be deplyed to https://team-04-vasscc-hourly.herokuapp.com

### Code Style

The code base uses Prettier for styling and ESLint (Airbnb). The project includes pre-commit hooks that are used to apply these when committing files.
You can check them manually like so:

```shell
prettier --write <filename>
```

```shell
eslint --fix <filename>
```

PostgresSQL - to connect to our postgres database, we used the npm package pg, which allows for connection and querying of databases from express.

Bearer - For authorization of a user on the database, we made use of the express-bearer-token package which allows us to use a temporary token for verification rather than the users credentials.

Input Validation - For validation of HTTP requests, we used express-validator to verify that inputs were of the correct type, format, and were valid.

Status Codes - For status codes we used http-status-codes to streamline to use of the status codes and to ensure everyone was using the intended codes.

Nanoid - This was used for creating a unique string for the course codes.

Testing is setup using Jest and SuperTest, in `code/backend` run `npm test`.

MaterialUI - used for the frontend components.

React Big Calendar - calendar for the frontend.

Toast - for frontend notifications.

Axios - package to submit api responses.

Recharts - frontend graphs for course analytics. 

### Making Changes

Please see [CONTRIBUTING.md](CONTRIBUTING.md) and follow git practices. Create a branch for any new changes you make with the following naming convention: `iter-xx-your-branch-name`. Commit messages should follow the template `Topic: Message` for better readability. Try to have at least 2 people review a PR.
