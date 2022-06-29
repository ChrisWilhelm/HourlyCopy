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