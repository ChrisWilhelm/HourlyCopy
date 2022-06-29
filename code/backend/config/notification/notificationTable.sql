DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications(
    accountId INT NOT NULL,
    notificationContent TEXT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    notificationId INT GENERATED ALWAYS AS IDENTITY,
    PRIMARY KEY (accountId, notificationContent, notificationId),
    CONSTRAINT fk_account
        FOREIGN KEY (accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE
);