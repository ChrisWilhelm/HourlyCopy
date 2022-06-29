DROP TABLE IF EXISTS officeHourQueue;
CREATE TABLE officeHourQueue(
    registrationId INT NOT NULL,
    assignedStartTime TIME NOT NULL,
    assignedEndTime TIME NOT NULL,
    queuePosition INT NOT NULL,
    PRIMARY KEY(registrationId, queuePosition),
    constraint fk_registration
        FOREIGN KEY (registrationId)
            REFERENCES registration(registrationId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS ohQueueExists;
CREATE TABLE ohQueueExists (
    officeHourId INT NOT NULL,
    ohDate DATE NOT NULL,
    PRIMARY KEY (officeHourId, ohDate),
    CONSTRAINT fk_officehourId
        FOREIGN KEY (officeHourId)
            REFERENCES officeHour(officeHourId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS waitlist;
CREATE TABLE waitlist(
    accountId INT NOT NULL,
    officeHourId INT NOT NULL,
    ohDate DATE NOT NULL,
    waitlistPosition INT NOT NULL,
    PRIMARY KEY(accountId, officeHourId, ohDate, waitlistPosition),
    constraint fk_account
        FOREIGN KEY (accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    constraint fk_officehourId
        FOREIGN KEY (officeHourId)
            REFERENCES officeHour(officeHourId)
            ON DELETE CASCADE
);

DROP TABLE If EXISTS noShow;
CREATE TABLE noShow(
    registrationId INT NOT NULL,
    assignedStartTime TIME NOT NULL,
    assignedEndTime TIME NOT NULL,
    PRIMARY KEY(registrationId),
    constraint fk_registration
        FOREIGN KEY (registrationId)
            REFERENCES registration(registrationId)
            ON DELETE CASCADE
);