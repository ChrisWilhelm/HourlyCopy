CREATE OR REPLACE FUNCTION studentIsNotAlreadyRegistered (inputofficehourId INT, inputohDate DATE, inputaccountId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN NOT EXISTS (SELECT r.registrationId
        FROM officehour as oh JOIN Registration as r ON oh.officehourId = r.officehourId
        WHERE r.accountId = inputaccountId AND r.ohDate = inputohDate AND r.isCancelled = FALSE AND oh.officeHourId = inputofficeHourId);
END;
$$ LANGUAGE plpgsql;