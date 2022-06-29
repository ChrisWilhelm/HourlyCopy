CREATE OR REPLACE FUNCTION getFeedbackForHostByCourseWithoutUserInfo(hostId INT, inputcourseId INT)
RETURNS table(feedback text) as $feedback$
BEGIN
    RETURN QUERY SELECT f.feedback FROM ((isHost as h JOIN officehour as oh ON oh.officeHourId = h.officeHourId)
        JOIN registration as r ON r.officeHourId = oh.officeHourId) JOIN officehourFeedback as f ON f.registrationId = r.registrationId
        WHERE oh.courseId = inputcourseId AND h.accountId = hostId;
END;
$feedback$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getFeedbackForHostByCourse(hostId INT, inputcourseId INT)
RETURNS TABLE(feedback TEXT, accountId INT, accountName TEXT, accountEmail TEXT, officehourId INT, ohdate DATE) as $$
DECLARE
    hostRec RECORD;
    accountRec RECORD;
    feedbackRec RECORD;
BEGIN
    FOR hostRec IN (SELECT oh.* FROM officehour as oh JOIN ishost as h on oh.officehourid = h.officehourid WHERE oh.courseid = inputcourseId AND h.accountId = hostId)
    LOOP
        FOR feedbackRec IN (SELECT f.*, r.accountId, r.ohdate FROM registration as r JOIN officehourFeedback as f ON f.registrationId = r.registrationId WHERE r.officehourId = hostRec.officeHourId)
        LOOP
            feedback:=feedbackRec.feedback;
            accountId:=feedbackRec.accountId;
            officehourid:=hostRec.officeHourId;
            ohdate:=feedbackRec.ohdate;
            SELECT * INTO accountRec FROM account as a WHERE a.accountId = feedbackRec.accountId;
            accountName:=accountRec.uName;
            accountEmail:=accountRec.email;
            RETURN NEXT;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;