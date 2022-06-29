DROP TABLE IF EXISTS officehour CASCADE;
CREATE TABLE officehour (
    officehourId INT GENERATED ALWAYS AS IDENTITY,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    recurringEvent boolean NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    ohLocation TEXT NOT NULL,
    courseId INT NOT NULL,
    maxSeats INT,
    timePerStudent INT NOT NULL,
    PRIMARY KEY (officehourId),
    CONSTRAINT fk_course
        FOREIGN KEY (courseId)
            REFERENCES Course(courseId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS isOnDayOfWeek CASCADE;
CREATE TABLE isOnDayOfWeek (
    officehourId INT NOT NULL,
    dayOfWeek DAYSOFWEEK NOT NULL,
    PRIMARY KEy(officehourId, dayOfWeek),
    CONSTRAINT fk_officehourId
        FOREIGN KEY (officehourId)
            REFERENCES officehour(officehourId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS isHost CASCADE;
CREATE TABLE isHost(
    officehourId INT NOT NULL,
    accountId INT NOT NULL,
    PRIMARY KEY (officehourId, accountId),
    CONSTRAINT fk_account
        FOREIGN KEY(accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    CONSTRAINT fk_officehourId
        FOREIGN KEY (officehourId)
            REFERENCES officehour(officehourId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS isCancelled CASCADE;
CREATE TABLE isCancelled(
    officehourId INT NOT NULL,
    cancelledDay DATE NOT NULL,
    PRIMARY KEY (officehourId, cancelledDay),
    CONSTRAINT fk_officehourId
        FOREIGN KEY (officehourId)
            REFERENCES officehour(officehourId)
            ON DELETE CASCADE
);