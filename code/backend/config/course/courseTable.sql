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