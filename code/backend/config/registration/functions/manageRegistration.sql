CREATE OR REPLACE FUNCTION addTopicToRegistration(inputregistrationId INT, inputtopicId INT)
RETURNS TABLE(topicId INT, registrationId INT) as $$
DECLARE
    rec RECORD;
BEGIN
    INSERT INTO registrationForTopic VALUES(inputregistrationId, inputtopicId) RETURNING * into rec;
    topicId:=rec.topicId;
    registrationId:=rec.registrationId;
    return next;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION cancelRegistration (inputregistrationId INT)
RETURNS BOOLEAN as $cancelled$
DECLARE
    cancelled BOOLEAN;
BEGIN
    UPDATE Registration SET isCancelled = TRUE WHERE Registration.registrationId = inputregistrationId;
    RETURN TRUE;
END;
$cancelled$ LANGUAGE plpgsql;