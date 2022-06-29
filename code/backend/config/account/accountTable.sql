DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE account (
    accountId INT GENERATED ALWAYS AS IDENTITY,
    uName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    accountPassword TEXT NOT NULL,
    phoneNumber TEXT UNIQUE,
    PRIMARY KEY(accountId)
);
