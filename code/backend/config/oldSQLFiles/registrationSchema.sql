DROP TABLE IF EXISTS Registration CASCADE;
CREATE TABLE Registration (
    registrationId INT GENERATED ALWAYS AS IDENTITY,
    accountId INT NOT NULL,
    isCancelled BOOLEAN NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    ohDate DATE NOT NULL,
    officehourId INT NOT NULL,
    queueNumber INT NOT NULL,
    PRIMARY KEY (registrationId),
    CONSTRAINT fk_account
        FOREIGN KEY(accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    CONSTRAINT fk_officehourId
        FOREIGN KEY (officehourId)
            REFERENCES officehour(officehourId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS officehourQuestions CASCADE;
CREATE TABLE officehourQuestions(
    registrationId INT NOT NULL,
    question TEXT NOT NULL,
    PRIMARY KEY (registrationId),
    CONSTRAINT fk_registrationId
        FOREIGN KEY (registrationId)
            REFERENCES Registration(registrationId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS officehourFeedback CASCADE;
CREATE TABLE officehourFeedback(
    registrationId INT NOT NULL,
    feedback TEXT NOT NULL,
    rating REAL CONSTRAINT validRating check (rating > 0 AND rating <= 5),
    PRIMARY KEY (registrationId),
    CONSTRAINT fk_registrationId
        FOREIGN KEY (registrationId)
            REFERENCES Registration(registrationId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS topicTag CASCADE;
CREATE TABLE topicTag(
    topicId INT GENERATED ALWAYS AS IDENTITY,
    topicValue TEXT NOT NULL UNIQUE,
    courseId TEXT NOT nULL,
    PRIMARY KEY (topicId),
    CONSTRAINT fk_courseId
        FOREIGN KEY (courseId)
            REFERENCES course(courseId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS registrationForTopic CASCADE;
CREATE TABLE registrationForTopic (
    registrationId INT NOT NULL,
    topicId INT NOT NULL,
    PRIMARY KEY (registrationId, topicId),
    CONSTRAINT fk_registrationId
        FOREIGN KEY (registrationId)
            REFERENCES Registration(registrationId)
            ON DELETE CASCADE,
    CONSTRAINT fk_topicId
        FOREIGN KEY (topicId)
            REFERENCES topicTag(topicId)
            ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION addTopicToRegistration(inputregistrationId INT, inputtopicId INT)
RETURNS TABLE(topicId INT, registrationId INT) as $$
DECLARE
    rec RECORD;
BEGIN
    INSERT INTO registrationForTopic VALUES(inputregistrationId, inputtopicId) RETURNING * into rec;
    topicId:=rec.topicId;
    registrationId:=rec.registrationId;
    return next;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION createRegistration(accountId INT, startTime TIME, endTime TIME, 
    inputohDate DATE, inputofficehourId INT)
RETURNS INTEGER as $newregistrationId$
DECLARE
    newregistrationId INTEGER;
    previousQueuePosition INTEGER;
BEGIN
    SELECT coalesce(max(r.queueNumber), 0) INTO previousQueuePosition FROM Registration r 
        WHERE r.officehourId = inputofficehourId AND r.ohDate = inputohDate;
    INSERT INTO Registration(accountId, isCancelled, startTime, endTime, ohDate, officehourId, queueNumber)
        VALUES (accountId, FALSE, startTime, endTime, inputohDate, inputofficehourId, previousQueuePosition + 1)
        RETURNING registrationId INTO newregistrationId;
    RETURN newregistrationId;
END;
$newregistrationId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION addOfficeHourQuestions(registrationId INT, question TEXT)
RETURNS INTEGER as $addedQuestionsRegistrationId$
DECLARE
    addedQuestionsRegistrationId INTEGER;
BEGIN
    INSERT INTO officehourQuestions(registrationId, question) VALUES(registrationId, question)
        RETURNING officehourQuestions.registrationId INTO addedQuestionsRegistrationId;
    RETURN addedQuestionsRegistrationId;
END;
$addedQuestionsRegistrationId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION addOfficeHourFeedback(registrationId INT, feedback TEXT)
RETURNS INTEGER as $addedFeedbackRegistrationId$
DECLARE
    addedFeedbackRegistrationId INTEGER;
BEGIN
    INSERT INTO officehourFeedback(registrationId, feedback) VALUES(registrationId, feedback)
        RETURNING officehourFeedback.registrationId INTO addedFeedbackRegistrationId;
    RETURN addedFeedbackRegistrationId;
END;
$addedFeedbackRegistrationId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cancelRegistration (inputregistrationId INT)
RETURNS BOOLEAN as $cancelled$
DECLARE
    cancelled BOOLEAN;
BEGIN
    UPDATE Registration SET isCancelled = TRUE WHERE Registration.registrationId = inputregistrationId;
    RETURN TRUE;
END;
$cancelled$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION studentIsNotAlreadyRegistered (inputofficehourId INT, inputohDate DATE, inputaccountId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN NOT EXISTS (SELECT r.registrationId
        FROM officehour as oh JOIN Registration as r ON oh.officehourId = r.officehourId
        WHERE r.accountId = inputaccountId AND r.ohDate = inputohDate AND r.isCancelled = FALSE AND oh.officeHourId = inputofficeHourId);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getRegistrationsForOfficeHours (inputofficeHourId INT)
RETURNS TABLE(registrationId INT, accountId INT, isCancelled boolean, startTime TIME,
endTime TIME, ohDate DATE, officeHourId INT, queueNumber INT) as $$
DECLARE
    res RECORD;
BEGIN
    FOR res IN (SELECT * FROM registration as r WHERE r.officeHourId = inputofficeHourId)
    LOOP
        registrationId:=res.registrationId;
        accountId:=res.accountId;
        isCancelled:=res.isCancelled;
        startTime:=res.startTime;
        endTime:=res.endTime;
        ohDate:=res.ohDate;
        officeHourId:=res.officeHourId;
        queueNumber:=res.queueNumber;
        RETURN NEXT;
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
    END LOOP;
END;
$result$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getFeedbackForHostByCourse(hostId INT, inputcourseId INT)
RETURNS table(feedback text) as $feedback$
BEGIN
    RETURN QUERY SELECT f.feedback FROM ((isHost as h JOIN officehour as oh ON oh.officeHourId = h.officeHourId)
        JOIN registration as r ON r.officeHourId = oh.officeHourId) JOIN officehourFeedback as f ON f.registrationId = r.registrationId
        WHERE oh.courseId = inputcourseId AND h.accountId = hostId;
END;
$feedback$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION getOfficeHourQuestionsByDate(inputofficeHourId INT, inputDate DATE)
RETURNS TABLE (questions TEXT, accountName TEXT, accountEmail TEXT, topics TEXT[]) as $$
DECLARE
    rec RECORD;
    question TEXT;
    userName TEXT;
    email TEXT;
    registrationTopics TEXT[];
BEGIN
    FOR rec IN (SELECT r.registrationId, r.accountId FROM registration as r WHERE r.officeHourId = inputofficeHourId AND r.ohDate = inputDate)
    LOOP
        SELECT array(SELECT t.topicValue FROM topicTag as t JOIN registrationForTopic as r ON r.topicId = t.topicId WHERE r.registrationId = rec.registrationId) into registrationTopics;
        SELECT a.uName INTO userName FROM account a WHERE a.accountId = rec.accountId;
        SELECT a.email INTO email FROM account a WHERE a.accountId = rec.accountId;
        if EXISTS(SELECT * from officehourQuestions as Q WHERE Q.registrationId = rec.registrationId) then
            SELECT q.question into question FROM officehourQuestions as Q WHERE Q.registrationId = rec.registrationId;
            questions:=question;
        ELSE
            questions:=null;
        end if;
        accountName:=userName;
        accountEmail:=email;
        topics:=registrationTopics;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

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

-- /* assumes inputstarttime and inputendtime are in range */
-- CREATE OR REPLACE FUNCTION isRegistrationBelowMaxCount(inputofficeHourId INT, inputDate DATE, inputStartTime TIME, inputEndTime TIME)
-- RETURNS TABLE (isBelowMaxSeats BOOLEAN, earliestStartInRange TIME, latestEndInRange TIME, eitherTime BOOLEAN) as $$
-- DECLARE
--     maxSeatsOH integer := (SELECT oh.maxseats FROM officehour as oh WHERE oh.officehourid = inputofficeHourId);
--     numOverlap integer := (SELECT count(r.registrationId) FROM registration as r WHERE r.officeHourId = inputofficeHourId AND
--         r.ohdate = inputDate AND (inputStartTime, inputEndTime) OVERLAPS (r.starttime, r.endtime));
--     nextPossibleStart TIME;
--     nextPossibleEnd TIME;
--     isPossibleRange INT;
--     isStartPossible INT;
--     isEndPossible INT;
-- BEGIN
--     IF maxSeatsOH >= numOverlap THEN
--         isBelowMaxSeats:= FALSE;
--         SELECT min(r.endtime) INTO nextPossibleStart FROM registration as r WHERE r.officeHourId = inputofficeHourId AND
--             r.ohdate = inputDate AND (inputStartTime, inputEndTime) OVERLAPS (r.starttime, r.endtime);
--         SELECT max(r.starttime) INTO nextPossibleEnd FROM registration as r WHERE r.officeHourId = inputofficeHourId AND
--             r.ohdate = inputDate AND (inputStartTime, inputEndTime) OVERLAPS (r.starttime, r.endtime);
--         SELECT count(r.registrationId) into isStartPossible FROM registration as r WHERE r.officeHourId = inputofficeHourId AND
--         r.ohdate = inputDate AND (nextPossibleStart, inputEndTime) OVERLAPS (r.starttime, r.endtime); 
--         SELECT count(r.registrationId) into isEndPossible FROM registration as r WHERE r.officeHourId = inputofficeHourId AND
--         r.ohdate = inputDate AND (inputStartTime, nextPossibleEnd) OVERLAPS (r.starttime, r.endtime); 
--         IF isStartPossible < maxSeatsOH AND isEndPossible < maxSeatsOH THEN
--             eitherTime:=true;
--             earliestStartInRange:=nextPossibleStart;
--             latestEndInRange:=nextPossibleEnd;
--         ELSIF isStartPossible < maxSeatsOH THEN
--             earliestStartInRange:=nextPossibleStart;
--             latestEndInRange:=inputEndTime;
--             eitherTime:=false;
--         ELSIF isEndPossible < maxSeatsOH THEN
--             earliestStartInRange:=inputStartTime;
--             latestEndInRange:=nextPossibleEnd;
--             eitherTime:=false;
--         ELSE
--             earliestStartInRange:=NULL;
--             latestEndInRange:=NULL;
--             eitherTime:=false;
--         END IF;
--     END IF;
--     IF maxSeatsOH > numOverlap THEN
--         isBelowMaxSeats:=true;
--         earliestStartInRange:=inputStartTime;
--         latestEndInRange:=inputEndTime;
--         eitherTime:=false;
--     END IF;
--     RETURN NEXT;
-- END;
-- $$ LANGUAGE plpgsql;