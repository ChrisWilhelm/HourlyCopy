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