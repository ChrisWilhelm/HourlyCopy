CREATE OR REPLACE FUNCTION getOfficeHourQuestionsByDate(inputofficeHourId INT, inputDate DATE)
RETURNS TABLE (questions TEXT, accountName TEXT, accountEmail TEXT, topics TEXT[]) as $$
DECLARE
    rec RECORD;
    question TEXT;
    userName TEXT;
    email TEXT;
    registrationTopics TEXT[];
BEGIN
    FOR rec IN (SELECT r.registrationId, r.accountId FROM registration as r WHERE r.officeHourId = inputofficeHourId AND r.ohDate = inputDate AND r.isCancelled = false)
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