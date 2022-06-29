DROP TYPE IF EXISTS SEMESTER CASCADE;
CREATE TYPE SEMESTER as ENUM('Summer', 'Fall', 'Winter', 'Spring'); 
DROP TYPE IF EXISTS DAYSOFWEEK CASCADE;
CREATE TYPE DAYSOFWEEK as ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'); 

DROP TABLE IF EXISTS numberToDayOfWeek CASCADE;
CREATE TABLE numberToDayOfWeek (
    dayNum INT NOT NULL UNIQUE,
    dayOfWeek DAYSOFWEEK NOT NULL UNIQUE,
    PRIMARY KEY (dayNum)
);
INSERT INTO numberToDayOfWeek(dayNum, dayOfWeek)
    VALUES (1, 'Monday');
INSERT INTO numberToDayOfWeek(dayNum, dayOfWeek)
    VALUES (2, 'Tuesday');
INSERT INTO numberToDayOfWeek(dayNum, dayOfWeek)
    VALUES (3, 'Wednesday');
INSERT INTO numberToDayOfWeek(dayNum, dayOfWeek)
    VALUES (4, 'Thursday');
INSERT INTO numberToDayOfWeek(dayNum, dayOfWeek)
    VALUES (5, 'Friday');
INSERT INTO numberToDayOfWeek(dayNum, dayOfWeek)
    VALUES (6, 'Saturday');
INSERT INTO numberToDayOfWeek(dayNum, dayOfWeek)
    VALUES (7, 'Sunday');

DROP TABLE IF EXISTS course CASCADE;
CREATE TABLE course (
    courseId INT GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    courseNumber TEXT NOT NULL,
    semester SEMESTER NOT NULL,
    calenderYear INT NOT NULL,
    code char(6) NOT NULL UNIQUE,
    PRIMARY KEY(CourseId)
);

DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE account (
    accountId INT GENERATED ALWAYS AS IDENTITY,
    uName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    accountPassword TEXT NOT NULL,
    phoneNumber TEXT UNIQUE,
    PRIMARY KEY(accountId)
);

DROP TABLE IF EXISTS isStudent CASCADE;
CREATE TABLE isStudent (
    courseId INT NOT NULL,
    accountId INT NOT NULL,
    PRIMARY KEY (accountId, courseId),
    CONSTRAINT fk_account
        FOREIGN KEY(accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    CONSTRAINT fk_course
        FOREIGN KEY (courseId)
            REFERENCES Course(courseId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS isStaff CASCADE;
CREATE TABLE isStaff (
    courseId INT NOT NULL,
    accountId INT NOT NULL,
    isInstructor boolean NOT NULL,
    PRIMARY KEY (accountId, courseId),
    CONSTRAINT fk_account
        FOREIGN KEY(accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    CONSTRAINT fk_course
        FOREIGN KEY (courseId)
            REFERENCES Course(courseId)
            ON DELETE CASCADE
);

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

DROP TABLE IF EXISTS Registration CASCADE;
CREATE TABLE Registration (
    registrationId INT GENERATED ALWAYS AS IDENTITY,
    accountId INT NOT NULL,
    isCancelled BOOLEAN NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    ohDate DATE NOT NULL,
    officehourId INT NOT NULL,
    queueNumber INT NOT NULL,
    PRIMARY KEY (registrationId),
    CONSTRAINT fk_account
        FOREIGN KEY(accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    CONSTRAINT fk_officehourId
        FOREIGN KEY (officehourId)
            REFERENCES officehour(officehourId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS officehourQuestions CASCADE;
CREATE TABLE officehourQuestions(
    registrationId INT NOT NULL,
    question TEXT NOT NULL,
    PRIMARY KEY (registrationId),
    CONSTRAINT fk_registrationId
        FOREIGN KEY (registrationId)
            REFERENCES Registration(registrationId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS officehourFeedback CASCADE;
CREATE TABLE officehourFeedback(
    registrationId INT NOT NULL,
    feedback TEXT NOT NULL,
    PRIMARY KEY (registrationId),
    CONSTRAINT fk_registrationId
        FOREIGN KEY (registrationId)
            REFERENCES Registration(registrationId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS topicTag CASCADE;
CREATE TABLE topicTag(
    topicId INT GENERATED ALWAYS AS IDENTITY,
    topicValue TEXT NOT NULL UNIQUE,
    PRIMARY KEY (topicId)
);

DROP TABLE IF EXISTS registrationForTopic CASCADE;
CREATE TABLE registrationForTopic (
    registrationId INT NOT NULL,
    topicId INT NOT NULL,
    PRIMARY KEY (registrationId, topicId),
    CONSTRAINT fk_registrationId
        FOREIGN KEY (registrationId)
            REFERENCES Registration(registrationId)
            ON DELETE CASCADE,
    CONSTRAINT fk_topicId
        FOREIGN KEY (topicId)
            REFERENCES topicTag(topicId)
            ON DELETE CASCADE
);