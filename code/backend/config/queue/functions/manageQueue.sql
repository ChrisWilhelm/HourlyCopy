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
