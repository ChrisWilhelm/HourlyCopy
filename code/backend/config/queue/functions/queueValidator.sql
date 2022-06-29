CREATE OR REPLACE FUNCTION isQueueGenerated(inputofficehourid INT, inputohdate DATE)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS (SELECT * FROM ohQueueExists as oh WHERE oh.officeHourId = inputofficeHourId AND oh.ohdate = inputohDate);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION isStudentOnWaitlist(inputaccountId INT, inputofficeHourId INT, inputohdate DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT * FROM waitlist WHERE accountId = inputaccountId AND officeHourId = inputofficeHourId AND ohdate = inputohdate);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION isStudentInQueue(inputaccountId INT, inputofficeHourId INT, inputohDate DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT Q.* FROM officeHourQueue as Q JOIN registration as r ON Q.registrationId = r.registrationId WHERE r.officeHourId = inputofficeHourId AND r.accountId = inputaccountId AND r.ohdate = inputohdate);
END;
$$ LANGUAGE plpgsql;