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