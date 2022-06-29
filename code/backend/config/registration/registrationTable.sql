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
    rating REAL CONSTRAINT validRating check (rating > 0 AND rating <= 5),
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
    courseId TEXT NOT nULL,
    PRIMARY KEY (topicId),
    CONSTRAINT fk_courseId
        FOREIGN KEY (courseId)
            REFERENCES course(courseId)
            ON DELETE CASCADE
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