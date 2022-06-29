CREATE OR REPLACE FUNCTION createOfficeHour(startTime TIME, endTime TIME, recurringEvent boolean,
    startDate DATE, endDate DATE, ohLocation TEXT, courseId INT)
RETURNS INTEGER as $newofficehourId$
DECLARE 
    newofficehourId INTEGER;
BEGIN
    INSERT INTO officehour (startTime, endTime, recurringEvent, 
    startDate, endDate, ohLocation, courseId) 
    VALUES (startTime, endTime, recurringEvent, 
    startDate, endDate, ohLocation, courseId) RETURNING officehourId INTO newofficehourId;
    RETURN newofficehourId;
END;
$newofficehourId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION createOfficeHour(startTime TIME, endTime TIME, recurringEvent boolean,
    startDate DATE, endDate DATE, ohLocation TEXT, courseId INT, maxSeats INT)
RETURNS INTEGER as $newofficehourId$
DECLARE 
    newofficehourId INTEGER;
BEGIN
    INSERT INTO officehour (startTime, endTime, recurringEvent, 
    startDate, endDate, ohLocation, courseId, maxSeats) 
    VALUES (startTime, endTime, recurringEvent, 
    startDate, endDate, ohLocation, courseId, maxSeats) RETURNING officehourId INTO newofficehourId;
    RETURN newofficehourId;
END;
$newofficehourId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION createOfficeHourTimeInterval(startTime TIME, endTime TIME, recurringEvent boolean,
    startDate DATE, endDate DATE, ohLocation TEXT, courseId INT, timeInterval INT)
RETURNS INTEGER as $newofficehourId$
DECLARE 
    newofficehourId INTEGER;
BEGIN
    INSERT INTO officehour (startTime, endTime, recurringEvent, 
    startDate, endDate, ohLocation, courseId, timePerStudent) 
    VALUES (startTime, endTime, recurringEvent, 
    startDate, endDate, ohLocation, courseId, timeInterval) RETURNING officehourId INTO newofficehourId;
    RETURN newofficehourId;
END;
$newofficehourId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION addDayOfWeek(officehourId INT, dayOfWeek DAYSOFWEEK)
RETURNS INTEGER as $dayAddedToOfficehourid$
DECLARE
    dayAddedToOfficehourid INTEGER;
BEGIN
    INSERT INTO isOnDayOfWeek(officehourId, dayOfWeek) VALUES (officehourId, dayOfWeek)
        RETURNING isOnDayOfWeek.officehourId INTO dayAddedToOfficehourid;
    RETURN dayAddedToOfficehourid;
END;
$dayAddedToOfficehourid$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION addHost(officehourId INT, accountId INT)
RETURNS INTEGER as $addedHostOfficeHourID$
DECLARE
    addedHostOfficeHourID INTEGER;
BEGIN
    INSERT INTO isHost (officehourId, accountId) VALUES(officehourId, accountId) 
    RETURNING isHost.officehourId INTO addedHostOfficeHourID;
    RETURN addedHostOfficeHourID;
END;
$addedHostOfficeHourID$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cancelOfficeHour(officehourId INT, cancelledDay DATE)
RETURNS INTEGER as $cancelledofficehourId$
DECLARE
    cancelledofficehourId INTEGER;
BEGIN
    INSERT INTO isCancelled(officehourId, cancelledDay) VALUES(officehourId, cancelledDay) 
    RETURNING isCancelled.officehourId INTO cancelledofficehourId;
    RETURN cancelledofficehourId;
END;
$cancelledofficehourId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deleteOfficeHourForUser (inputAccountId INT)
RETURNS BOOLEAN as $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN (SELECT * FROM isHost WHERE accountId = inputAccountId)
    LOOP
        -- check if they are only host and delete if that is the case
        IF NOT EXISTS (SELECT * FROM isHost as h WHERE rec.officehourid = h.officehourid AND inputaccountid != h.accountid) THEN
            DELETE FROM officeHour WHERE officeHourId = rec.officehourid;
        ELSE
            DELETE FROM isHost WHERE officehourId = rec.officeHourId AND accountId = inputaccountId;
        END IF;
    END LOOP;
    return true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deleteOfficeHour (inputofficehourid INT)
RETURNS BOOLEAN as $$
DECLARE
    rec RECORD;
BEGIN
    IF NOT EXISTS (SELECT * FROM isHost as h WHERE inputofficehourid = h.officehourid AND inputaccountid != h.accountid) THEN
        DELETE FROM officeHour WHERE officeHourId = rec.officehourid;
        return true;
    ELSE
        DELETE FROM isHost WHERE officehourId = rec.officeHourId AND accountId = inputaccountId;
        return false;
    END IF;
END;
$$ LANGUAGE plpgsql;