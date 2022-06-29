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