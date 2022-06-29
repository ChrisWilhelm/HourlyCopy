DROP FUNCTION removeSpecificNotification;
CREATE OR REPLACE FUNCTION removeSpecificNotification(inputNotificationId INT)
RETURNS BOOLEAN as $isDeleted$
BEGIN
    DELETE FROM notifications WHERE notifications.notificationId = inputNotificationId;
    RETURN TRUE;
END;
$isDeleted$ LANGUAGE plpgsql;

CREATE FUNCTION getNotificationsByUser(inputaccountId INT)
RETURNS TABLE(notificationId INT, notificationContent TEXT, createdAt TIMESTAMP) as $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN (SELECT * FROM notifications as n where n.accountId = inputaccountId ORDER BY n.createdAt DESC)
    LOOP
        notificationId:=rec.notificationId;
        notificationContent:=rec.notificationContent;
        createdAt:=rec.createdAt;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION addNotification(inputaccountId INT, content TEXT)
RETURNS TABLE(notificationId INT, notificationContent TEXT, createdAt TIMESTAMP) as $$
DECLARE
    rec RECORD;
BEGIN
    INSERT INTO notifications(accountId, notificationContent) VALUES(inputaccountId, content) RETURNING * INTO rec;
    notificationId:=rec.notificationId;
    notificationContent:=rec.notificationContent;
    createdAt:=rec.createdAt;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION clearNotifications(inputaccountId INT)
RETURNS INT as $numRemoved$
DECLARE
    count INTEGER;
BEGIN
    WITH deleted AS (DELETE FROM notifications WHERE notifications.accountId = inputaccountId RETURNING *) SELECT count(*) INTO count FROM deleted;
    RETURN count;
END;
$numRemoved$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validateNotificationId (inputNotificationId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT n.notificationId
        FROM notifications n WHERE n.notificationId = inputNotificationId);
END;
$$ LANGUAGE plpgsql;