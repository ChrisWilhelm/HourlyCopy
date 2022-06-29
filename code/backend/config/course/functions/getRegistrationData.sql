CREATE OR REPLACE FUNCTION getRegistrationCountPerStudent(inputCourseId INT)
RETURNS TABLE (userName TEXT, email TEXT, accountId INT, count INT) as $$
DECLARE
    rec RECORD;
    accountRec RECORD;
    countReg INT;
BEGIN
    FOR rec IN (SELECT * FROM isStudent where courseId = inputCourseId)
    LOOP
        SELECT a.* into accountRec FROM account as a where a.accountId = rec.accountId;
        SELECT count(r.*) into countReg FROM registration as r JOIN officehour as oh on r.officehourid = oh.officehourid 
            where r.accountId = accountRec.accountId AND oh.courseId = inputCourseId AND r.iscancelled = false;
        userName:=accountRec.uName;
        email:=accountRec.email;
        accountId:=accountRec.accountId;
        count:=countReg;
        return next;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getRegistrationCountPerTime(inputCourseId INT)
RETURNS TABLE (startTime TIME, endTime TIME, count INT) as $$
DECLARE
    countReg INT;
    startTimeVar TIME:='00:00:00';
    endTimeVar TIME:='01:00:00';
    i INT := 0;
BEGIN
    WHILE i < 24
    LOOP
        SELECT count(r.*) into countReg FROM registration as r JOIN officehour as oh on r.officehourid = oh.officehourid 
            where  oh.courseId = inputCourseId AND r.iscancelled = false AND r.startTime >= startTimeVar AND r.endTime <= endTimeVar;
        startTime:=startTimeVar;
        endTime:=endTimeVar;
        count:=countReg;
        i:=i + 1;
        startTimeVar:=endTimeVar;
        endTimeVar:= endTimeVar + INTERVAL '1 hour';
        return next;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getRegistrationCountPerStaff(inputCourseId INT)
RETURNS TABLE (userName TEXT, email TEXT, accountId INT, count INT) as $$
DECLARE
    rec RECORD;
    accountRec RECORD;
    countReg INT;
BEGIN
    FOR rec IN (SELECT * FROM isStaff where courseId = inputCourseId)
    LOOP
        SELECT a.* into accountRec FROM account as a where a.accountId = rec.accountId;
        SELECT count(r.*) into countReg FROM (registration as r JOIN isHost as h on r.officehourid = h.officehourid) 
            JOIN officehour as oh on r.officeHourId = oh.officehourid where h.accountId = accountRec.accountId 
            AND h.officehourId = r.officehourId AND r.iscancelled = false AND oh.courseId = inputcourseId;
        userName:=accountRec.uName;
        email:=accountRec.email;
        accountId:=accountRec.accountId;
        count:=countReg;
        return next;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getRegistrationCountPerDOW(inputCourseId INT)
RETURNS TABLE (hostNames TEXT[], hostEmails TEXT[], hostAccountIds INT[], count INT, dayOfWeek DAYSOFWEEK, startTime TIME, endTime TIME, officeHourId INT) as $$
DECLARE
    rec RECORD;
    dowRec RECORD;
    dowInt INT;
    countReg INT;
    hostNameArr TEXT[];
    hostEmailArr TEXT[];
    hostIdArr INT[];
BEGIN
    FOR rec IN (SELECT * FROM officeHour where courseId = inputCourseId)
    LOOP
        FOR dowRec IN (SELECT * FROM isOnDayOfWeek as dow WHERE dow.officehourid = rec.officehourId)
        LOOP
            SELECT dayNum INTO dowInt FROM numberToDayOfWeek as n WHERE n.dayOfWeek = dowRec.dayOfWeek;
            SELECT count(r.*) into countReg FROM registration as r JOIN officehour as oh on r.officehourid = oh.officehourid 
                where oh.courseId = inputCourseId AND r.iscancelled = false AND dowInt = (select extract(isodow from r.ohdate));
            SELECT array(SELECT a.uName FROM isHost as h join account as a on h.accountid = a.accountid where h.officehourid = rec.officehourid ORDER BY a.accountId) into hostNameArr;
            SELECT array(SELECT a.email FROM isHost as h join account as a on h.accountid = a.accountid where h.officehourid = rec.officehourid ORDER BY a.accountId) into hostEmailArr;
            SELECT array(SELECT a.accountId FROM isHost as h join account as a on h.accountid = a.accountid where h.officehourid = rec.officehourid ORDER BY a.accountId) into hostIdArr;
            hostNames:=hostNameArr;
            hostEmails:=hostEmailArr;
            hostAccountIds:=hostIdArr;
            count:=countReg;
            dayOfWeek:=dowRec.dayOfWeek;
            startTime:=rec.startTime;
            endTime:=rec.endTime;
            officeHourId:=rec.officeHourId;
            return next;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;