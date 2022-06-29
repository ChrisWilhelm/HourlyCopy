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

CREATE OR REPLACE FUNCTION isQueueGenerated(inputofficehourid INT, inputohdate DATE)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS (SELECT * FROM ohQueueExists as oh WHERE oh.officeHourId = inputofficeHourId AND oh.ohdate = inputohDate);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getQueue(inputofficeHourId INT, inputohdate DATE)
RETURNS TABLE(uName TEXT, accountId INT, registrationId INT, startTime TIME, endTime TIME, queuePosition INT) as $$
DECLARE
    rec RECORD;
    queueNum INT := 0;
BEGIN
    FOR rec IN (SELECT q.*, a.accountId, a.uName FROM (officehourqueue as q JOIN registration as r on r.registrationId = q.registrationId) JOIN account as a on r.accountId = a.accountId WHERE r.officehourId = inputofficeHourId AND r.ohdate = inputohDate ORDER BY r.startTime)
    LOOP
        uName:=rec.uName;
        accountId:=rec.accountId;
        registrationId:=rec.registrationId;
        startTime:=rec.assignedStartTime;
        endTime:=rec.assignedEndTime;
        queuePosition:=rec.queuePosition;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getQueueStudent(inputofficeHourId INT, inputohdate DATE, accountId INT)
RETURNS TABLE(startTime TIME, endTime TIME, queuePosition INT, isUsersAccount BOOLEAN) as $$
DECLARE
    rec RECORD;
    regRec RECORD;
    queueNum INT := 0;
BEGIN
    FOR rec IN (SELECT q.* FROM (officehourqueue as q JOIN registration as r on r.registrationId = q.registrationId) JOIN account as a on r.accountId = a.accountId WHERE r.officehourId = inputofficeHourId AND r.ohdate = inputohDate ORDER BY r.startTime)
    LOOP
        startTime:=rec.assignedStartTime;
        endTime:=rec.assignedEndTime;
        queuePosition:=rec.queuePosition;
        SELECT * INTO regRec FROM registration WHERE registrationId = rec.registrationId;
        IF regRec.accountId = accountId THEN
            isUsersAccount:=true;
        ELSE
            isUsersAccount:=false;
        END IF;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getNoShow(inputofficeHourId INT, inputohdate DATE)
RETURNS TABLE(uName TEXT, accountId INT, registrationId INT, startTime TIME, endTime TIME, queuePosition INT) as $$
DECLARE
    rec RECORD;
    queueNum INT := 0;
BEGIN
    FOR rec IN (SELECT q.*, a.uName, a.accountId FROM (noshow as q JOIN registration as r on r.registrationId = q.registrationId) JOIN account as a on r.accountId = a.accountId WHERE r.officehourId = inputofficeHourId AND r.ohdate = inputohDate ORDER BY r.startTime)
    LOOP
        uName:=rec.uName;
        accountId:=rec.accountId;
        registrationId:=rec.registrationId;
        startTime:=rec.assignedStartTime;
        endTime:=rec.assignedEndTime;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getWaitlist(inputofficehourId INT, inputohdate DATE)
RETURNS TABLE(uName TEXT, accountId INT, officehourId INT, ohdate DATE, waitlistPosition INT) AS $$
DECLARE
    rec RECORD;
    accountRec RECORD;
BEGIN
    FOR rec IN (SELECT * FROM waitlist as w WHERE w.officehourId = inputofficeHourId AND w.ohdate = inputohdate ORDER BY w.waitlistPosition)
    LOOP
        SELECT * into accountRec from account as a where a.accountId = rec.accountId;
        uName:=accountRec.uName;
        accountId:=rec.accountId;
        officehourId:=rec.officehourid;
        ohdate:=rec.ohdate;
        waitlistPosition:=rec.waitlistPosition;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getWaitlistStudentView(inputofficehourId INT, inputohdate DATE, accountId INT)
RETURNS TABLE(officehourId INT, ohdate DATE, waitlistPosition INT, isUsersAccount BOOLEAN) AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN (SELECT * FROM waitlist as w WHERE w.officehourId = inputofficeHourId AND w.ohdate = inputohdate ORDER BY w.waitlistPosition)
    LOOP
        officehourId:=rec.officehourid;
        ohdate:=rec.ohdate;
        waitlistPosition:=rec.waitlistPosition;
        if rec.accountId = accountId THEN
            isUsersAccount := true;
        else 
            isUsersAccount := false;
        end if;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generateQueue(inputofficeHourId INT, inputohdate DATE)
RETURNS TABLE(registrationId INT, startTime TIME, endTime TIME, queuePosition INT) as $$
DECLARE
    rec RECORD;
    queueNum INT := 0;
BEGIN
    INSERT INTO ohQueueExists VALUES(inputofficeHourId, inputohdate);
    FOR rec IN (SELECT * FROM registration as r WHERE r.officehourId = inputofficeHourId AND r.ohdate = inputohDate ORDER BY r.startTime)
    LOOP
        INSERT INTO officeHourQueue VALUES (rec.registrationId, rec.startTime, rec.endTime, queueNum);
        registrationId:=rec.registrationId;
        startTime:=rec.startTime;
        endTime:=rec.endTime;
        queuePosition:=queueNum;
        queueNum:=queueNum+1;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION joinWaitlist(inputaccountId INT, inputofficeHourId INT, inputohdate DATE)
RETURNS TABLE(accountId INT, officehourId INT, ohdate DATE, waitlistPosition INT) AS $$
DECLARE
    nextPosition INT;
    rec RECORD;
BEGIN
    SELECT count(*) INTO nextPosition FROM waitlist as w WHERE w.officehourId = inputofficeHourId AND w.ohdate = inputohdate;
    nextPosition:= nextPosition + 1;
    IF EXISTS (SELECT * FROM waitlist as w WHERE  w.officehourId = inputofficeHourId AND w.ohdate = inputohdate AND w.accountId = inputaccountId) THEN
        SELECT * into rec FROM waitlist as w WHERE  w.officehourId = inputofficeHourId AND w.ohdate = inputohdate AND w.accountId = inputaccountId;
    ELSIF EXISTS (SELECT * FROM noshow as n join registration as r on n.registrationid = r.registrationid where r.accountid = inputaccountid AND r.officehourId = inputofficeHourId AND r.ohdate = inputohDate) THEN
        SELECT r.* into rec FROM noshow as n join registration as r on n.registrationid = r.registrationid where r.accountid = inputaccountid AND r.officehourId = inputofficeHourId AND r.ohdate = inputohDate;
        DELETE FROM noshow where registrationId = rec.registrationId;
        INSERT INTO waitlist VALUES(inputaccountId, inputofficeHourId, inputohdate, nextPosition) RETURNING * into rec;
    ELSE
        INSERT INTO waitlist VALUES(inputaccountId, inputofficeHourId, inputohdate, nextPosition) RETURNING * into rec;
    end if;
    accountId:=rec.accountId;
    officehourId:=rec.officehourid;
    ohdate:=rec.ohdate;
    waitlistPosition:=rec.waitlistPosition;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION transferToNoShow(inputregistrationId INT)
RETURNS TABLE(registrationId INT, assignedStartTime TIME, assignedEndTime TIME) as $$
DECLARE
    rec RECORD;
    nextPosition INT;
BEGIN
    DELETE FROM officeHourQueue as OH WHERE OH.registrationId = inputregistrationId RETURNING * INTO rec;
    INSERT INTO noShow VALUES (rec.registrationId, rec.assignedStartTime, rec.assignedEndTime);
    registrationId:=rec.registrationId;
    assignedStartTime:=rec.assignedStartTime;
    assignedEndTime:=rec.assignedEndTime;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION removeFromQueue(inputregistrationId INT)
RETURNS BOOLEAN as $$
DECLARE
    rec RECORD;
    regOHId INT;
BEGIN
    SELECT r.officehourid INTO regOHId FROM registration as r where r.registrationId = inputregistrationId;
    SELECT Q.* INTO REC FROM officeHourQueue as Q JOIN registration as r on Q.registrationId = r.registrationId WHERE r.officehourid = regOHId
        ORDER BY Q.assignedStartTime LIMIT 1;
    IF rec.registrationId = inputregistrationId THEN
        DELETE FROM officeHourQueue WHERE registrationId = inputregistrationId;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION removeFromWaitlist(inputaccountId INT, inputofficeHourId INT, inputohdate DATE)
RETURNS INT as $Position$
DECLARE
    pos INT;
BEGIN
    DELETE FROM waitlist WHERE accountId = inputaccountId AND officehourId = inputofficeHourId AND ohdate = inputohdate RETURNING waitlistPosition INTO pos;
    UPDATE WAITLIST SET waitlistPosition = waitlistPosition - 1  WHERE officeHourId = inputofficeHourId AND inputohdate = ohdate AND pos < waitlistPosition;
    RETURN pos;
END;
$Position$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION isStudentOnWaitlist(inputaccountId INT, inputofficeHourId INT, inputohdate DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT * FROM waitlist WHERE accountId = inputaccountId AND officeHourId = inputofficeHourId AND ohdate = inputohdate);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION isStudentInQueue(inputaccountId INT, inputofficeHourId INT, inputohDate DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT Q.* FROM officeHourQueue as Q JOIN registration as r ON Q.registrationId = r.registrationId WHERE r.officeHourId = inputofficeHourId AND r.accountId = inputaccountId AND r.ohdate = inputohdate);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION moveToBackOfWaitlist(inputofficeHourId INT, inputohDate DATE)
RETURNS INT AS $$
DECLARE
    rec RECORD;
    toBack RECORD;
    oldPosition INT;
BEGIN
    SELECT W.* into toBack FROM waitlist as W WHERE W.officeHourId = inputofficeHourId AND W.ohdate = inputohDate ORDER BY W.waitlistPosition LIMIT 1;
    oldPosition:=toBack.waitlistPosition;
    DELETE FROM waitlist WHERE accountId = toBack.accountId AND officehourId = inputofficeHourId AND ohdate = inputohdate;
    UPDATE waitlist SET waitlistPosition = waitlistPosition - 1 WHERE officehourid = inputofficeHourId AND ohdate = inputohdate;
    SELECT * INTO rec FROM joinWaitlist(toBack.accountId, toBack.officeHourId, toBack.ohdate);
    RETURN rec.waitlistPosition;
END;
$$ LANGUAGE plpgsql;
