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
