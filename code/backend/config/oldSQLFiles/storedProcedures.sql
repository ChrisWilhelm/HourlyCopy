/* TODO: Organize FUNCTIONS FOR CREATING ENTITY */
CREATE OR REPLACE FUNCTION createCourse(
    title TEXT, courseNumber TEXT, semester SEMESTER, 
    calenderYear INT, code char(6))
RETURNS integer as $newcourseid$
DECLARE 
    newcourseid integer;
BEGIN
    INSERT INTO course (title, courseNumber, semester, calenderYear, code) 
    VALUES (title, courseNumber, semester, calenderYear, code) RETURNING courseId INTO newcourseid;
    RETURN newcourseid;
END;
$newcourseid$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION createAccount(uName TEXT, email TEXT, 
    accountPassword TEXT, phoneNumber TEXT)
RETURNS integer as $newaccountid$
DECLARE 
    newaccountid integer;
BEGIN
    INSERT INTO account (uName, email, accountPassword, phoneNumber) 
    VALUES (uName, email, accountPassword, phoneNumber) RETURNING accountId INTO newaccountid;
    RETURN newaccountid;
END;
$newaccountid$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION addStudent(courseId INT, accountId INT)
RETURNS INTEGER as $courseId$
BEGIN
    INSERT INTO isStudent (courseId, accountId) VALUES (courseId, accountId);
    RETURN courseId;
END;
$courseId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION addStaff(courseId INT, accountId INT, isInstructor BOOLEAN)
RETURNS INTEGER as $courseId$
BEGIN
    INSERT INTO isStaff (courseId, accountId, isInstructor) 
        VALUES (courseId, accountId, isInstructor);
    RETURN courseId;
END;
$courseId$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION cancelRegistration (inputregistrationId INT)
RETURNS BOOLEAN as $cancelled$
DECLARE
    cancelled BOOLEAN;
BEGIN
    UPDATE Registration SET isCancelled = TRUE WHERE Registration.registrationId = inputregistrationId;
    RETURN TRUE;
END;
$cancelled$ LANGUAGE plpgsql;

DROP FUNCTION validateOfficeHourId;
CREATE OR REPLACE FUNCTION validateOfficeHourId (inputofficehourId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT oh.officehourId
        FROM officehour oh WHERE oh.officehourId = inputofficehourId);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION validateCourseId;
CREATE OR REPLACE FUNCTION validateCourseId (inputcourseId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS (SELECT c.courseId
        FROM course c WHERE c.courseId = inputcourseId);
    RETURN isCourseId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION studentIsNotAlreadyRegistered (inputofficehourId INT, inputohDate DATE, inputaccountId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN NOT EXISTS (SELECT r.registrationId
        FROM officehour as oh JOIN Registration as r ON oh.officehourId = r.officehourId
        WHERE r.accountId = inputaccountId AND r.ohDate = inputohDate AND r.isCancelled = FALSE AND oh.officeHourId = inputofficeHourId);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION isAccountStaff;
CREATE OR REPLACE FUNCTION isAccountStaff (inputcourseId INT, inputaccountId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT s.accountId
        FROM course as c JOIN isStaff as s ON c.courseId = s.courseId
        WHERE s.accountId = inputaccountId AND c.courseId = inputcourseId);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION isAccountStudent;
CREATE OR REPLACE FUNCTION isAccountStudent (inputcourseId INT, inputaccountId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT s.accountId
        FROM course as c JOIN isStudent as s ON c.courseId = s.courseId
        WHERE s.accountId = inputaccountId AND c.courseId = inputcourseId);
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

CREATE OR REPLACE FUNCTION updateUserPhoneNumber(inputaccountId INT, newphoneNumber TEXT)
RETURNS INT as $accountUpdated$
DECLARE
    accountUpdated INT;
BEGIN
    UPDATE account SET phoneNumber = newphoneNumber WHERE accountId = inputaccountId RETURNING accountId INTO accountUpdated;
    RETURN accountUpdated;
END;
$accountUpdated$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION updateUserPassword(inputaccountId INT, newaccountPassword TEXT)
RETURNS INT as $accountUpdated$
DECLARE
    accountUpdated INT;
BEGIN
    UPDATE account SET accountPassword = newaccountPassword WHERE accountId = inputaccountId RETURNING accountId INTO accountUpdated;
    RETURN accountUpdated;
END;
$accountUpdated$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getStudentCourses (inputaccountId INT)
RETURNS TABLE(courseId INT, title TEXT, courseNumber TEXT, semester SEMESTER, calenderYear INT, code char(6)) as $$
DECLARE
    res RECORD;
BEGIN
    FOR res in (SELECT c.* FROM isStudent as stu JOIN course as c ON stu.courseId = c.courseId WHERE stu.accountId = inputaccountId)
    LOOP
        courseId:=res.courseId;
        title:=res.title;
        courseNumber:=res.courseNumber;
        semester:=res.semester;
        calenderYear:=res.calenderYear;
        code:=res.code;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getStaffCourses (inputaccountId INT)
RETURNS TABLE(courseId INT, title TEXT, courseNumber TEXT, semester SEMESTER, calenderYear INT, code char(6)) as $$
DECLARE
    res RECORD;
BEGIN
    FOR res IN (SELECT c.* FROM isStaff as stu JOIN course as c ON stu.courseId = c.courseId WHERE stu.accountId = inputaccountId)
    LOOP
        courseId:=res.courseId;
        title:=res.title;
        courseNumber:=res.courseNumber;
        semester:=res.semester;
        calenderYear:=res.calenderYear;
        code:=res.code;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION getRegistrationsForOfficeHours;
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

CREATE OR REPLACE FUNCTION getUser (inputuserAccountId INT)
RETURNS RECORD as $result$
DECLARE
    result RECORD;
BEGIN
    SELECT * INTO result FROM (SELECT a.accountId, a.uName, a.email, a.phoneNumber FROM account as a
        WHERE a.accountId = inputuserAccountId) as res;
    RETURN result;
END;
$result$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION getCourseByCode (inputcourseCode char(6))
RETURNS INT as $courseId$
DECLARE
    courseId INT;
BEGIN
    SELECT c.courseId INTO courseId FROM course as c WHERE c.code = inputcourseCode;
    RETURN courseId;
END;
$courseId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION removeStudentFromCourse (inputaccountId INT, inputcourseId INT)
RETURNS INT as $accountId$
BEGIN
    DELETE FROM isStudent as s WHERE s.accountId = inputaccountId AND s.courseId = inputcourseId;
    RETURN inputaccountId;
END;
$accountId$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION removeStaffFromCourse (inputaccountId INT, inputcourseId INT)
RETURNS INT as $accountId$
BEGIN
    DELETE FROM isStaff as s WHERE s.accountId = inputaccountId AND s.courseId = inputcourseId;
    RETURN inputaccountId;
END;
$accountId$ LANGUAGE plpgsql;

DROP FUNCTION validateCourseCode;
CREATE OR REPLACE FUNCTION validateCourseCode (inputcourseCode char(6))
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT  c.courseId 
        FROM course c WHERE c.code = inputcourseCode);
    RETURN isCourseCode;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION accountLogin (inputuserEmail TEXT)
RETURNS RECORD as $result$
DECLARE
    result RECORD;
BEGIN
    SELECT * INTO result FROM account as a WHERE a.email = inputuserEmail;
    RETURN result;
END;
$result$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION getFeedbackForHostByCourse(hostId INT, inputcourseId INT)
RETURNS table(feedback text) as $feedback$
BEGIN
    RETURN QUERY SELECT f.feedback FROM ((isHost as h JOIN officehour as oh ON oh.officeHourId = h.officeHourId)
        JOIN registration as r ON r.officeHourId = oh.officeHourId) JOIN officehourFeedback as f ON f.registrationId = r.registrationId
        WHERE oh.courseId = inputcourseId AND h.accountId = hostId;
END;
$feedback$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getOfficeHoursForCourseWithInfo(inputcourseId INT)
RETURNS table(hostName TEXT, hostEmail TEXT, officeHourId INT, startTime TIME, endTime TIME, recurringEvent BOOLEAN,
startDate DATE, endDate DATE, ohLocation TEXT, courseId INT, maxSeats INT, daysOfWeek json, cancelledDays json) as $officehours$
DECLARE 
    res RECORD;
    cancelledDayArr json;
    ohDaysOfWeek json;
BEGIN
    FOR res IN(SELECT a.uName, a.email, oh.* FROM (officehour as oh JOIN isHost as h ON oh.officeHourId = h.officeHourId) 
        JOIN account as a ON a.accountId = h.accountId WHERE oh.courseId = inputcourseId)
    LOOP
        SELECT json_agg(dow) into ohDaysOfWeek FROM (SELECT w.dayOfWeek FROM isOnDayOfWeek as w WHERE w.officehourId = res.officeHourId) dow;
        SELECT json_agg(cancelled) INTO cancelledDayArr FROM (SELECT c.cancelledDay FROM isCancelled as c WHERE c.officeHourId = res.officeHourId) cancelled;
        hostName:=res.uName;
        hostEmail:=res.email;
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
BEGIN
    FOR hostOH IN (SELECT h.officeHourId FROM isHost as h WHERE h.accountId = hostId)
    LOOP
        SELECT * INTO officeHourRecord FROM officehour as oh WHERE oh.officeHourId = hostOH.officeHourId;
        FOR dow IN (SELECT d.dayOfWeek FROM isOnDayOfWeek as d WHERE d.officeHourId = hostOH.officeHourId)
        LOOP
            if (SELECT array_position(daysOfWeek, dow.dayOfWeek)) IS NOT NULL then
                if (SELECT (officeHourRecord.startDate, officeHourRecord.endDate) OVERLAPS (startDate, endDate)) then
                    if (SELECT (officeHourRecord.startTime, officeHourRecord.endTime) OVERLAPS (startTime, endTime)) then
                        RETURN FALSE;
                        EXIT;
                    end if;
                end if;
            end if;
        END LOOP;
    END LOOP;
    RETURN TRUE;
END;
$isValid$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getOfficeHourQuestionsByDate(inputofficeHourId INT, inputDate DATE)
RETURNS TABLE (questions TEXT, accountName TEXT, accountEmail TEXT) as $$
DECLARE
    rec RECORD;
    question TEXT;
    userName TEXT;
    email TEXT;
BEGIN
    FOR rec IN (SELECT r.registrationId, r.accountId FROM registration as r WHERE r.officeHourId = inputofficeHourId AND r.ohDate = inputDate)
    LOOP
        if EXISTS(SELECT * from officehourQuestions as Q WHERE Q.registrationId = rec.registrationId) then
            SELECT q.question into question FROM officehourQuestions as Q WHERE Q.registrationId = rec.registrationId;
            SELECT a.uName INTO userName FROM account a WHERE a.accountId = rec.accountId;
            SELECT a.email INTO email FROM account a WHERE a.accountId = rec.accountId;
            questions:=question;
            accountName:=userName;
            accountEmail:=email;
            RETURN NEXT;
        end if;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION getStudentsForCourse(inputCourseId INT)
RETURNS TABLE(userName TEXT, email TEXT, accountId INT) as $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec in (SELECT a.uName, a.email, a.accountId FROM isStudent as s JOIN account as a ON s.accountId = a.accountId WHERE s.courseId = inputCourseId)
    LOOP
        userName:=rec.uName;
        email:=rec.email;
        accountId:=rec.accountId;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getInstructorsForCourse(inputCourseId INT)
RETURNS TABLE(userName TEXT, email TEXT, accountId INT) as $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec in (SELECT a.uName, a.email, a.accountId FROM isStaff as s JOIN account as a ON s.accountId = a.accountId WHERE s.courseId = inputCourseId AND s.isInstructor = TRUE)
    LOOP
        userName:=rec.uName;
        email:=rec.email;
        accountId:=rec.accountId;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getStaffForCourse(inputCourseId INT)
RETURNS TABLE(userName TEXT, email TEXT, accountId INT) as $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec in (SELECT a.uName, a.email, a.accountId FROM isStaff as s JOIN account as a ON s.accountId = a.accountId WHERE s.courseId = inputCourseId AND s.isInstructor = FALSE)
    LOOP
        userName:=rec.uName;
        email:=rec.email;
        accountId:=rec.accountId;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
