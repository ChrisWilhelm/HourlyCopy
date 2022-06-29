DROP TABLE IF EXISTS course CASCADE;
CREATE TABLE course (
    courseId INT GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    courseNumber TEXT NOT NULL,
    semester SEMESTER NOT NULL,
    calenderYear INT NOT NULL,
    code char(6) NOT NULL UNIQUE,
    PRIMARY KEY(CourseId)
);

DROP TABLE IF EXISTS isStudent CASCADE;
CREATE TABLE isStudent (
    courseId INT NOT NULL,
    accountId INT NOT NULL,
    PRIMARY KEY (accountId, courseId),
    CONSTRAINT fk_account
        FOREIGN KEY(accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    CONSTRAINT fk_course
        FOREIGN KEY (courseId)
            REFERENCES Course(courseId)
            ON DELETE CASCADE
);

DROP TABLE IF EXISTS isStaff CASCADE;
CREATE TABLE isStaff (
    courseId INT NOT NULL,
    accountId INT NOT NULL,
    isInstructor boolean NOT NULL,
    PRIMARY KEY (accountId, courseId),
    CONSTRAINT fk_account
        FOREIGN KEY(accountId)
            REFERENCES account(accountId)
            ON DELETE CASCADE,
    CONSTRAINT fk_course
        FOREIGN KEY (courseId)
            REFERENCES Course(courseId)
            ON DELETE CASCADE
);

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

DROP FUNCTION validateCourseId;
CREATE OR REPLACE FUNCTION validateCourseId (inputcourseId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS (SELECT c.courseId
        FROM course c WHERE c.courseId = inputcourseId);
    RETURN isCourseId;
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

CREATE OR REPLACE FUNCTION deleteCourse(inputCourseId INT)
RETURNS BOOLEAN as $$
DECLARE
    rec RECORD;
BEGIN
    DELETE FROM course WHERE courseId = inputCourseId RETURNING * INTO rec;
    if rec.courseId = inputCourseId THEN
        return true;
    else
        return false;
    end if;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION deleteCourse(inputCourseId INT)
RETURNS BOOLEAN as $$
DECLARE
    rec RECORD;
BEGIN
    DELETE FROM course WHERE courseId = inputCourseId RETURNING * INTO rec;
    if rec.courseId = inputCourseId THEN
        return true;
    else
        return false;
    end if;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION removeSelfFromCourse(inputCourseId INT, inputAccountId INT)
RETURNS TABLE (removed BOOLEAN, msg TEXT) as $$
DECLARE
    rec RECORD;
BEGIN
    IF EXISTS(SELECT * FROM isStudent WHERE accountId = inputaccountId AND courseId = inputCourseId) THEN
        DELETE FROM isStudent WHERE accountId = inputAccountId AND courseId = inputCourseId;
        DELETE FROM registration as r WHERE r.accountId = inputAccountId AND r.officeHourId IN (SELECT oh.officehourid FROM officehour as oh where oh.courseid = inputCourseId);
        msg:='Removed you from the student Roster of the course';
        removed:=true;
        RETURN NEXT;
    ELSIF EXISTS(SELECT * FROM isStaff WHERE accountId = inputaccountId AND courseId = inputCourseId) THEN
        SELECT * INTO rec FROM isStaff WHERE accountId = inputaccountId AND courseId = inputCourseId;
        IF rec.isInstructor THEN
            IF EXISTS(SELECT * FROM isStaff WHERE courseId = inputCourseId ANd isInstructor = true AND accountId != inputAccountId) THEN
                DELETE FROM isStaff WHERE accountId = inputAccountId AND courseId = inputCourseId;
                DELETE FROM officehour as oh where oh.courseid = inputCourseId AND oh.officehourid IN 
                    (SELECT q.officehourid FROM (SELECT count(h.*) 
                    as count, h.officehourid FROM isHost as h 
                    WHERE h.officehourid IN (SELECT host.officehourid FROM ishost as host WHERE host.accountId = inputAccountId) 
                    GROUP BY h.officeHourId) as q WHERE q.count = 1);
                DELETE FROM isHost as h WHERE h.accountId = inputAccountId AND h.officeHourId IN 
                    (SELECT q.officehourid FROM (SELECT count(h.*) 
                    as count, h.officehourid FROM isHost as h JOIN officehour as oh ON h.officehourid = oh.officehourid 
                    WHERE h.officehourid IN (SELECT host.officehourid FROM ishost as host WHERE host.accountId = inputAccountId) 
                    AND oh.courseid = inputCourseId GROUP BY h.officeHourId) as q WHERE q.count > 1);
                msg:='Removed you from the list of instructors for the course';
                removed:=true;
                RETURN NEXT;
            ELSE
                msg:='You are the only instructor remaining, to remove yourself, you must end the course';
                removed:=false;
                RETURN NEXT;
            END IF;
        ELSE
            DELETE FROM isStaff WHERE accountId = inputAccountId AND courseId = inputCourseId;
            DELETE FROM officehour as oh where oh.courseid = inputCourseId AND oh.officehourid IN 
                (SELECT q.officehourid FROM (SELECT count(h.*) 
                as count, h.officehourid FROM isHost as h 
                WHERE h.officehourid IN (SELECT host.officehourid FROM ishost as host WHERE host.accountId = inputAccountId) 
                GROUP BY h.officeHourId) as q WHERE q.count = 1);
            DELETE FROM isHost as h WHERE h.accountId = inputAccountId AND h.officeHourId IN 
                (SELECT q.officehourid FROM (SELECT count(h.*) 
                as count, h.officehourid FROM isHost as h JOIN officehour as oh ON h.officehourid = oh.officehourid 
                WHERE h.officehourid IN (SELECT host.officehourid FROM ishost as host WHERE host.accountId = inputAccountId) 
                AND oh.courseid = inputCourseId GROUP BY h.officeHourId) as q WHERE q.count > 1);
            msg:='Removed you from the list of staff';
            removed:=true;
            RETURN NEXT;
        END IF;
    ELSE
        msg:='ERROR, cannot remove user';
        removed:=false;
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION removeFromCourse(inputCourseId INT, inputStaffId INT, inputAccountId INT)
RETURNS TABLE (removed BOOLEAN, msg TEXT) as $$
DECLARE
    rec RECORD;
BEGIN
    SELECT * INTO rec FROM isStaff WHERE courseId = inputCourseId AND accountId = inputStaffId;
    IF rec.isInstructor THEN
        IF EXISTS(SELECT * FROM isStudent WHERE courseId = inputCourseId AND accountId = inputAccountId) THEN
            DELETE FROM isStudent WHERE courseId = inputCourseId AND accountId = inputAccountId;
            DELETE FROM registration as r WHERE r.accountId = inputAccountId AND r.officeHourId IN 
                (SELECT oh.officehourid FROM officehour as oh where oh.courseid = inputCourseId);
            msg:= 'The student was removed from the roster';
            removed:=true;
            RETURN NEXT;
        ELSIF EXISTS(SELECT * FROM isStaff WHERE courseId = inputCourseId AND accountId = inputAccountId AND isInstructor = FALSE) THEN
            DELETE FROM isStaff WHERE courseId = inputCourseId AND accountId = inputAccountId;
            DELETE FROM officehour as oh where oh.courseid = inputCourseId AND oh.officehourid IN 
                (SELECT q.officehourid FROM (SELECT count(h.*) 
                as count, h.officehourid FROM isHost as h 
                WHERE h.officehourid IN (SELECT host.officehourid FROM ishost as host WHERE host.accountId = inputAccountId) 
                GROUP BY h.officeHourId) as q WHERE q.count = 1);
            DELETE FROM isHost as h WHERE h.accountId = inputAccountId AND h.officeHourId IN 
                (SELECT q.officehourid FROM (SELECT count(h.*) 
                as count, h.officehourid FROM isHost as h JOIN officehour as oh ON h.officehourid = oh.officehourid 
                WHERE h.officehourid IN (SELECT host.officehourid FROM ishost as host WHERE host.accountId = inputAccountId) 
                AND oh.courseid = inputCourseId GROUP BY h.officeHourId) as q WHERE q.count > 1);
            msg:='The staff was removed from the course';
            removed:=true;
            RETURN NEXT;
        ELSE
            msg:='The account is not a course staff or student for this course';
            removed:=false;
            RETURN NEXT;
        END IF;
    ELSE
        IF EXISTS(SELECT * FROM isStudent WHERE courseId = inputCourseId AND accountId = inputAccountId) THEN
            DELETE FROM isStudent WHERE courseId = inputCourseId AND accountId = inputAccountId;
            DELETE FROM registration as r WHERE r.accountId = inputAccountId AND r.officeHourId IN 
                (SELECT oh.officehourid FROM officehour as oh where oh.courseid = inputCourseId);
            msg:='The student was removed from the roster';
            removed:=true;
            RETURN NEXT;
        ELSE
            msg:='This student is not a student in the course';
            removed:=false;
            RETURN NEXT;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION getRoleInCourse( inputcourseId INT, inputuserId INT)
RETURNS TEXT AS $$
BEGIN
    IF EXISTS(SELECT * FROM isStudent WHERE courseId = inputcourseid AND accountId = inputuserId) THEN
        RETURN 'student';
    ELSIF EXISTS (SELECT * FROM isStaff WHERE courseID = inputcourseid AND accountID = inputuserid AND isInstructor = true) THEN
        RETURN 'instructor';
    ELSIF EXISTS (SELECT * FROM isStaff WHERE courseID = inputcourseid AND accountID = inputuserid AND isInstructor = false) THEN
        RETURN 'staff';
    ELSE
        RETURN 'na';
    END IF;
END;
$$ LANGUAGE plpgsql;
