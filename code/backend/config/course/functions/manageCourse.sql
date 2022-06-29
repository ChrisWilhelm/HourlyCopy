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