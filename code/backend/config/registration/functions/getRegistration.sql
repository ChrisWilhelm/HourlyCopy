CREATE OR REPLACE FUNCTION getRegistrationsForOfficeHours (inputofficeHourId INT)
RETURNS TABLE(registrationId INT, accountId INT, isCancelled boolean, startTime TIME,
endTime TIME, ohDate DATE, officeHourId INT, queueNumber INT) as $$
DECLARE
    res RECORD;
BEGIN
    FOR res IN (SELECT * FROM registration as r WHERE r.officeHourId = inputofficeHourId)
    LOOP
        IF NOT EXISTS(SELECT * FROM noShow as n WHERE n.registrationId = res.registrationId) THEN
            registrationId:=res.registrationId;
            accountId:=res.accountId;
            isCancelled:=res.isCancelled;
            startTime:=res.startTime;
            endTime:=res.endTime;
            ohDate:=res.ohDate;
            officeHourId:=res.officeHourId;
            queueNumber:=res.queueNumber;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getUserRegistration(inputaccountId INT)
RETURNS TABLE(registrationId INT, accountId INT, isCancelled BOOLEAN,
startTime TIME, endTime TIME, ohDate Date, officeHourId INT, queueNumber INT,
question TEXT, feedback TEXT, officeHourStartTime TIME, officehourEndTime TIME, 
recurringEvent BOOLEAN, startDate dATe, endDate DATE, ohLocation TEXT, courseId INT, maxSeats INT, hostInfo json) as $result$
DECLARE 
    res RECORD;
    hostData json;
BEGIN
    FOR res IN (SELECT reg.*, q.question, f.feedback, oh.startTime as officeHourStartTime, oh.endTime as officehourEndTime, oh.recurringEvent, oh.startDate,
        oh.endDate, oh.ohLocation, oh.courseId, oh.maxSeats FROM (((SELECT * FROM registration as r 
        WHERE r.accountId = inputaccountId) as reg LEFT JOIN officehour as oh ON oh.officeHourId = reg.officeHourId) 
        LEFT JOIN officehourFeedback as f ON reg.registrationId = f.registrationId) LEFT JOIN officehourQuestions as q 
        ON q.registrationId = reg.registrationId)
    LOOP
        IF NOT EXISTS(SELECT * FROM noShow as n WHERE n.registrationId = res.registrationId) THEN
            SELECT json_agg(hosts) into hostData FROM (SELECT a.uName as name, a.email, a.accountId FROM isHost as h JOIN account as a 
            ON h.accountId = a.accountId WHERE h.officeHourId = res.officeHourId) hosts;
            registrationId:=res.registrationId;
            accountId:=res.accountId;
            isCancelled:=res.isCancelled;
            startTime:=res.startTime;
            endTime:=res.endTime;
            ohDate:=res.ohDate;
            officeHourId:=res.officeHourId;
            queueNumber:=res.queueNumber;
            question:=res.question;
            feedback:=res.feedback;
            officeHourStartTime:=res.officeHourStartTime;
            officehourEndTime:=res.officehourEndTime;
            recurringEvent:=res.recurringEvent;
            startDate:=res.startDate;
            endDate:=res.endDate;
            ohLocation:=res.ohLocation;
            courseId:=res.courseId;
            maxSeats:=res.maxSeats;
            hostInfo:=hostData;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$result$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getUserRegistrationForCourse(inputaccountId INT, inputcourseId INT)
RETURNS TABLE(registrationId INT, accountId INT, isCancelled BOOLEAN,
startTime TIME, endTime TIME, ohDate Date, officeHourId INT, queueNumber INT,
question TEXT, feedback TEXT, officeHourStartTime TIME, officehourEndTime TIME, 
recurringEvent BOOLEAN, startDate dATe, endDate DATE, ohLocation TEXT, courseId INT, maxSeats INT, hostInfo json) as $result$
DECLARE 
    res RECORD;
    hostData json;
BEGIN
    FOR res IN (SELECT reg.*, q.question, f.feedback, oh.startTime as officeHourStartTime, oh.endTime as officehourEndTime, oh.recurringEvent, oh.startDate,
        oh.endDate, oh.ohLocation, oh.courseId, oh.maxSeats FROM (((SELECT * FROM registration as r 
        WHERE r.accountId = inputaccountId) as reg LEFT JOIN officehour as oh ON oh.officeHourId = reg.officeHourId) 
        LEFT JOIN officehourFeedback as f ON reg.registrationId = f.registrationId) LEFT JOIN officehourQuestions as q 
        ON q.registrationId = reg.registrationId WHERE oh.courseId = inputcourseId)
    LOOP
        IF NOT EXISTS(SELECT * FROM noShow as n WHERE n.registrationId = res.registrationId) THEN

            SELECT json_agg(hosts) into hostData FROM (SELECT a.uName as name, a.email, a.accountId FROM isHost as h JOIN account as a 
            ON h.accountId = a.accountId WHERE h.officeHourId = res.officeHourId) hosts;
            registrationId:=res.registrationId;
            accountId:=res.accountId;
            isCancelled:=res.isCancelled;
            startTime:=res.startTime;
            endTime:=res.endTime;
            ohDate:=res.ohDate;
            officeHourId:=res.officeHourId;
            queueNumber:=res.queueNumber;
            question:=res.question;
            feedback:=res.feedback;
            officeHourStartTime:=res.officeHourStartTime;
            officehourEndTime:=res.officehourEndTime;
            recurringEvent:=res.recurringEvent;
            startDate:=res.startDate;
            endDate:=res.endDate;
            ohLocation:=res.ohLocation;
            courseId:=res.courseId;
            maxSeats:=res.maxSeats;
            hostInfo:=hostData;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$result$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getAvailableIntervals(inputofficeHourId INT, inputohdate DATE)
RETURNS TABLE(startTime TIME, endTime TIME) as $$
DECLARE 
    ohstartTime TIME;
    ohendTime TIME;
    timeInterval INT;
    rec RECORD;
BEGIN
    SELECT oh.startTime, oh.endTime, oh.timePerStudent INTO rec FROM officehour as oh WHERE oh.officehourid = inputofficehourId;
    ohstartTime:=rec.startTime;
    ohendTime:=rec.endTime;
    timeInterval:=rec.timePerStudent;
    WHILE ohstartTime < ohendTime loop
        if not exists (SELECT * FROM registration as r WHERE r.iscancelled = false and r.officehourid = inputofficeHourId AND r.ohdate = inputohDate AND (r.startTime, r.endTime) OVERLAPS (ohstartTime, ohstartTime + INTERVAL '1 minutes' * timeInterval) ) then
            if (ohstartTime + INTERVAL '1 minutes' * timeInterval <= ohendTime) then
                startTime:=ohstartTime;
                endTime:= ohstartTime + INTERVAL '1 minutes' * timeInterval;
                return next;
            end if;
        end if;
        ohstartTime:= ohstartTime + INTERVAL '1 minutes' * timeInterval;
    end loop;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION allInfoFromRegistration(inputregistrationId INT)
RETURNS TABLE (registrationId INT, accountId INT, isCancelled BOOLEAN, startTime TIME, endTime TIME,
    ohDate DATE, officehourId INT, queueNumber INT, uName TEXT, email TEXT, phoneNumber TEXT, ohstartTime TIME,
    ohendTime TIME, recurringEvent boolean, startDate DATE, endDate DATE, ohLocation TEXT,
    courseId INT, timePerStudent INT, hostNames TEXT[], hostaccountid INT[]) as $$
DECLARE
    regRec RECORD;
    ohRec RECORD;
    accRec RECORD;
    hostRec RECORD;
    hostArray TEXT[];
    hostIds INT[];
BEGIN
    SELECT * into regRec FROM registration as r WHERE r.registrationId = inputregistrationId;
    SELECT * into ohRec FROM officehour as oh WHERE oh.officehourid = regRec.officehourId;
    SELECT * into accRec FROM account as a WHERE a.accountId = regRec.accountId;
    registrationId:=regRec.registrationId;
    accountId:= regRec.accountId;
    isCancelled:=regRec.isCancelled;
    startTime:=regRec.startTime;
    endTime:=regRec.endTime;
    ohDate:=regRec.ohdate;
    officehourid:=regRec.officehourid;
    queueNumber:=regRec.queueNumber;
    uName:=accRec.uName;
    email:=accRec.email;
    phoneNumber:=accRec.phoneNumber;
    ohstartTime:=ohRec.startTime;
    ohendTime:=ohRec.endTime;
    recurringEvent:=ohRec.recurringEvent;
    startDate:=ohRec.startDate;
    endDate:=ohRec.endDate;
    ohLocation:=ohRec.ohLocation;
    courseId:=ohRec.courseId;
    timePerStudent:=ohRec.timePerStudent;
    FOR hostRec IN (SELECT account.* FROM account JOIN isHost ON account.accountId = isHost.accountID WHERE isHost.officeHourId = ohRec.officeHourId)
    LOOP
        hostArray:=array_append(hostArray, hostRec.uName);
        hostIds:=array_append(hostIds, hostRec.accountId);
    END LOOP;
    hostNames:=hostArray;
    hostaccountid:=hostIds;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;