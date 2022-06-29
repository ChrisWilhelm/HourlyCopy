DROP FUNCTION isOfficeHoursOnDay;
CREATE OR REPLACE FUNCTION isOfficeHoursOnDay(inputofficehourId INT, inputohDate DATE)
RETURNS BOOLEAN as $$
DECLARE
    numdayOfWeek INT;
BEGIN
    SELECT extract(isodow FROM inputohDate) INTO numdayOfWeek;
    RETURN EXISTS (SELECt  oh.officehourId
        FROM (officehour as oh JOIN isOnDayOfWeek as d
        ON oh.officehourId = d.officehourId) JOIN numberToDayOfWeek as n
        ON n.dayOfWeek = d.dayOfWeek
        WHERE d.officehourId = inputofficehourId AND n.dayNum = numdayOfWeek);
    RETURN isOnDay;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION isOfficeHoursCancelledOnDate;
CREATE OR REPLACE FUNCTION isOfficeHoursCancelledOnDate (inputofficehourId INT, inputohDate DATE)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT oh.officehourId
        FROM officehour as oh JOIN isCancelled as c ON oh.officehourId = c.officehourId
        WHERE c.cancelledDay = inputohDate AND oh.officeHourId = inputofficehourId);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION validateOfficeHourId;
CREATE OR REPLACE FUNCTION validateOfficeHourId (inputofficehourId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT oh.officehourId
        FROM officehour oh WHERE oh.officehourId = inputofficehourId);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION isAccountHost;
CREATE OR REPLACE FUNCTION isAccountHost (inputofficehourId INT, inputaccountId INT)
RETURNS BOOLEAN as $$
BEGIN
    RETURN EXISTS(SELECT h.accountId
        FROM officehour as oh JOIN isHost as h ON oh.officehourId = h.officehourId
        WHERE oh.officehourId = inputofficehourId AND h.accountId = inputaccountId);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION isOfficeHoursSchedulingValid(startDate DATE, endDate DATE, startTime TIME, endTime TIME, 
recurringEvent boolean, daysOfWeek DAYSOFWEEK[], courseId INT, hostId INT)
RETURNS BOOLEAN as $isValid$
DECLARE
    hostOH RECORD;
    dow RECORD;
    officeHourRecord RECORD;
    ohStart DATE;
    ohEnd DATE;
    dowInt INT;
    dowIndex INT;
BEGIN
    FOR hostOH IN (SELECT h.officeHourId FROM isHost as h WHERE h.accountId = hostId)
    LOOP
        SELECT * INTO officeHourRecord FROM officehour as oh WHERE oh.officeHourId = hostOH.officeHourId;
        ohStart:=officeHourRecord.startDate;
        ohEnd:=officeHourRecord.endDate;
        if (SELECT (officeHourRecord.startDate, officeHourRecord.endDate) OVERLAPS (startDate, endDate)) then
            WHILE ohStart <= ohEnd
            LOOP
                if not exists(SELECT * from isCancelled as c where hostOh.officeHourId = c.officeHourid AND c.cancelledday = ohStart) then
                    FOR dow IN (SELECT d.dayOfWeek FROM isOnDayOfWeek as d WHERE d.officeHourId = hostOH.officeHourId)
                    LOOP
                        SELECT extract(dow from ohStart) into dowInt;
                        SELECT array_position(daysOfWeek, dow.dayOfWeek) INTO dowIndex;
                        if (SELECT n.dayOfWeek FROM numberToDayOfWeek as n where n.dayNum = dowInt) = daysOfWeek[dowIndex] then      
                                if (SELECT (officeHourRecord.startTime, officeHourRecord.endTime) OVERLAPS (startTime, endTime)) then
                                    RETURN FALSE;
                                    EXIT;
                                end if;
                        end if;
                    END LOOP;
                end if;
                ohStart:= ohStart + interval '1 day';
            END LOOP;
        end if;
    END LOOP;
    RETURN TRUE;
END;
$isValid$ LANGUAGE plpgsql;