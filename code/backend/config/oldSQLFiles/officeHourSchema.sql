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

DROP FUNCTION isOfficeHoursOnDay;
CREATE OR REPLACE FUNCTION isOfficeHoursOnDay(inputofficehourId INT, inputohDate DATE)
RETURNS BOOLEAN as $$
DECLARE
    numdayOfWeek INT;
BEGIN
    SELECT extract(isodow FROM inputohDate) INTO numdayOfWeek;
    RETURN EXISTS (SELECt  oh.officehourId
        FROM (officehour as oh JOIN isOnDayOfWeek as d
        ON oh.officehourId = d.officehourId) JOIN numberToDayOfWeek as n
        ON n.dayOfWeek = d.dayOfWeek
        WHERE d.officehourId = inputofficehourId AND n.dayNum = numdayOfWeek);
    RETURN isOnDay;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION isOfficeHoursCancelledOnDate;
CREATE OR REPLACE FUNCTION isOfficeHoursCancelledOnDate (inputofficehourId INT, inputohDate DATE)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT oh.officehourId
        FROM officehour as oh JOIN isCancelled as c ON oh.officehourId = c.officehourId
        WHERE c.cancelledDay = inputohDate AND oh.officeHourId = inputofficehourId);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION validateOfficeHourId;
CREATE OR REPLACE FUNCTION validateOfficeHourId (inputofficehourId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT oh.officehourId
        FROM officehour oh WHERE oh.officehourId = inputofficehourId);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION isAccountHost;
CREATE OR REPLACE FUNCTION isAccountHost (inputofficehourId INT, inputaccountId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT h.accountId
        FROM officehour as oh JOIN isHost as h ON oh.officehourId = h.officehourId
        WHERE oh.officehourId = inputofficehourId AND h.accountId = inputaccountId);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getOfficeHoursForCourse (inputcourseId INT)
RETURNS INT[] as $officehourIds$
DECLARE
    officehourIds INT[]:=ARRAY[]::INT[];
BEGIN
    SELECT array(SELECT oh.officehourId FROM course as c
    JOIN officehour as oh ON c.courseId = oh.courseId WHERE
    c.courseId = inputcourseId) INTO officehourIds;
    RETURN officehourIds;
END;
$officehourIds$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getOfficeHoursByCourseAndHost(inputaccountId INT, inputcourseId INT)
RETURNS TABLE(officehourId INT, startTime TIME, endTime TIME, recurringEvent boolean, startDate DATE,
endDate DATE, ohLocation TEXT, courseId INT, maxSeats INT, accountId INT, daysOfWeek json, cancelledDays json) as $result$
DECLARE
    res RECORD;
    ohDaysOfWeek JSON; 
    cancelledDayArr JSON;
BEGIN
    FOR res IN (SELECT oh.*, h.accountId FROM officehour as oh JOIN isHost as h ON oh.officeHourId = h.officeHourId
        WHERE h.accountId = inputaccountId AND oh.courseId = inputcourseId)
    LOOP
        SELECT json_agg(dow) into ohDaysOfWeek FROM (SELECT w.dayOfWeek FROM isOnDayOfWeek as w WHERE w.officehourId = res.officeHourId) dow;
        SELECT json_agg(cancelled) INTO cancelledDayArr FROM (SELECT c.cancelledDay FROM isCancelled as c WHERE c.officeHourId = res.officeHourId) cancelled;
        officeHourId:=res.officeHourId;
        startTime:=res.startTime;
        endTime:=res.endTime;
        recurringEvent:=res.recurringEvent;
        startDate:=res.startDate;
        endDate:=res.endDate;
        ohLocation:=res.ohLocation;
        courseId:=res.courseId;
        maxSeats:=res.maxSeats;
        accountId:=res.accountId;
        daysOfWeek:=ohDaysOfWeek;
        cancelledDays:=cancelledDayArr;
        RETURN NEXT;
    END LOOP;
END;
$result$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getOfficeHoursForCourseWithInfo(inputcourseId INT)
RETURNS table(hostName TEXT[], hostEmail TEXT[], hostId INT[], officeHourId INT, startTime TIME, endTime TIME, recurringEvent BOOLEAN,
startDate DATE, endDate DATE, ohLocation TEXT, courseId INT, maxSeats INT, daysOfWeek json, cancelledDays json) as $officehours$
DECLARE 
    res RECORD;
    cancelledDayArr json;
    ohDaysOfWeek json;
    hostNames TEXT[];
    hostEmails TEXT[];
    hostIds TEXT[];
BEGIN
    FOR res IN(SELECT oh.* FROM officehour as oh WHERE oh.courseId = inputcourseId)
    LOOP
        SELECT json_agg(dow) into ohDaysOfWeek FROM (SELECT w.dayOfWeek FROM isOnDayOfWeek as w WHERE w.officehourId = res.officeHourId) dow;
        SELECT json_agg(cancelled) INTO cancelledDayArr FROM (SELECT c.cancelledDay FROM isCancelled as c WHERE c.officeHourId = res.officeHourId) cancelled;
        SELECT array(SELECT a.uName FROM isHost as h join account as a on h.accountid = a.accountid where h.officehourid = res.officehourid ORDER BY a.accountId) into hostNames;
        SELECT array(SELECT a.email FROM isHost as h join account as a on h.accountid = a.accountid where h.officehourid = res.officehourid ORDER BY a.accountId) into hostEmails;
        SELECT array(SELECT a.accountId FROM isHost as h join account as a on h.accountid = a.accountid where h.officehourid = res.officehourid ORDER BY a.accountId) into hostIds;
        hostName:=hostNames;
        hostEmail:=hostEmails;
        hostId:=hostIds;
        officeHourId:=res.officeHourId;
        startTime:=res.startTime;
        endTime:=res.endTime;
        recurringEvent:=res.recurringEvent;
        startDate:=res.startDate;
        endDate:=res.endDate;
        ohLocation:=res.ohLocation;
        courseId:=res.courseId;
        maxSeats:=res.maxSeats;
        daysOfWeek:=ohDaysOfWeek;
        cancelledDays:=cancelledDayArr;
        RETURN NEXT;
    END LOOP;
END;
$officehours$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getOfficeHoursById (inputofficeHourId INT)
RETURNS table(officeHourId INT, startTime TIME, endTime TIME, recurringEvent BOOLEAN,
startDate DATE, endDate DATE, ohLocation TEXT, courseId INT, maxSeats INT,
hostsInfo json, daysOfWeek json, cancelledDays json) as $$
DECLARE
    res RECORD;
    hostData json;
    ohDaysOfWeek JSON;
    cancelledDayArr json;
BEGIN
    FOR res IN (SELECT * FROM officehour as oh WHERE oh.officeHourId = inputofficeHourId)
    LOOP
        SELECT json_agg(hosts) into hostData FROM (SELECT a.uName as name, a.email, a.accountId FROM isHost as h JOIN account as a 
        ON h.accountId = a.accountId WHERE h.officeHourId = inputofficeHourId) hosts;
        SELECT json_agg(dow) into ohDaysOfWeek FROM (SELECT w.dayOfWeek FROM isOnDayOfWeek as w WHERE w.officehourId = inputofficeHourId) dow;
        SELECT json_agg(cancelled) INTO cancelledDayArr FROM (SELECT c.cancelledDay FROM isCancelled as c WHERE c.officeHourId = res.officeHourId) cancelled;
        officeHourId:=res.officeHourId;
        startTime:=res.startTime;
        endTime:=res.endTime;
        recurringEvent:=res.recurringEvent;
        startDate:=res.startDate;
        endDate:=res.endDate;
        ohLocation:=res.ohLocation;
        courseId:=res.courseId;
        maxSeats:=res.maxSeats;
        hostsInfo:=hostData;
        daysOfWeek:=ohDaysOfWeek;
        cancelledDays:=cancelledDayArr;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION isOfficeHoursSchedulingValid(startDate DATE, endDate DATE, startTime TIME, endTime TIME, 
recurringEvent boolean, daysOfWeek DAYSOFWEEK[], courseId INT, hostId INT)
RETURNS BOOLEAN as $isValid$
DECLARE
    hostOH RECORD;
    dow RECORD;
    officeHourRecord RECORD;
    ohStart DATE;
    ohEnd DATE;
    dowInt INT;
    dowIndex INT;
BEGIN
    FOR hostOH IN (SELECT h.officeHourId FROM isHost as h WHERE h.accountId = hostId)
    LOOP
        SELECT * INTO officeHourRecord FROM officehour as oh WHERE oh.officeHourId = hostOH.officeHourId;
        ohStart:=officeHourRecord.startDate;
        ohEnd:=officeHourRecord.endDate;
        if (SELECT (officeHourRecord.startDate, officeHourRecord.endDate) OVERLAPS (startDate, endDate)) then
            WHILE ohStart <= ohEnd
            LOOP
                if not exists(SELECT * from isCancelled as c where hostOh.officeHourId = c.officeHourid AND c.cancelledday = ohStart) then
                    FOR dow IN (SELECT d.dayOfWeek FROM isOnDayOfWeek as d WHERE d.officeHourId = hostOH.officeHourId)
                    LOOP
                        SELECT extract(dow from ohStart) into dowInt;
                        SELECT array_position(daysOfWeek, dow.dayOfWeek) INTO dowIndex;
                        if (SELECT n.dayOfWeek FROM numberToDayOfWeek as n where n.dayNum = dowInt) = daysOfWeek[dowIndex] then      
                                if (SELECT (officeHourRecord.startTime, officeHourRecord.endTime) OVERLAPS (startTime, endTime)) then
                                    RETURN FALSE;
                                    EXIT;
                                end if;
                        end if;
                    END LOOP;
                end if;
                ohStart:= ohStart + interval '1 day';
            END LOOP;
        end if;
    END LOOP;
    RETURN TRUE;
END;
$isValid$ LANGUAGE plpgsql;

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