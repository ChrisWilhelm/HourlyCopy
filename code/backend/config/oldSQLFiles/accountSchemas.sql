DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE account (
    accountId INT GENERATED ALWAYS AS IDENTITY,
    uName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    accountPassword TEXT NOT NULL,
    phoneNumber TEXT UNIQUE,
    PRIMARY KEY(accountId)
);

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

CREATE OR REPLACE FUNCTION accountLogin (inputuserEmail TEXT)
RETURNS RECORD as $result$
DECLARE
    result RECORD;
BEGIN
    SELECT * INTO result FROM account as a WHERE a.email = inputuserEmail;
    RETURN result;
END;
$result$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deleteAccount(inputaccountEmail TEXT)
RETURNS BOOLEAN as $$
DECLARE
    deleteAccountId INT;
    rec RECORD;
BEGIN
    IF EXISTS (SELECT a.* FROM account as a WHERE a.email = inputaccountEmail) THEN
        SELECT account.accountId INTO deleteAccountId FROM account WHERE email = inputaccountEmail;
        FOR rec IN (SELECT s.courseId FROM isStaff as s WHERE s.accountId = deleteAccountId)
        LOOP
            PERFORM deleteOfficeHourForUser(deleteAccountId);
            IF NOT EXISTS(SELECT * FROM isStaff as s WHERE s.accountId != deleteAccountId AND s.courseId = rec.courseId AND s.isInstructor = true) THEN
                PERFORM deleteCourse(rec.courseId);
            ELSE 
                DELETE FROM isStaff as s WHERE s.accountId = deleteAccountId AND s.courseId = rec.courseId;
            END IF;
        END LOOP;
        DELETE FROM account WHERE accountId = deleteAccountId;
        RETURN true;
    ELSE 
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;