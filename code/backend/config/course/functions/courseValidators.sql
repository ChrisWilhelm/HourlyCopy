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

DROP FUNCTION validateCourseCode;
CREATE OR REPLACE FUNCTION validateCourseCode (inputcourseCode char(6))
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT  c.courseId 
        FROM course c WHERE c.code = inputcourseCode);
    RETURN isCourseCode;
END;
$$ LANGUAGE plpgsql;