/* good insert */
INSERT INTO course (title, courseNumber, semester, calenderYear, code)
    VALUES ('OOSE', '601.421', 'Fall', 2022, 'ABCDEF');
/* repeat course code, should fail*/ /*Successfully failed!*/
INSERT INTO course (title, courseNumber, semester, calenderYear, code)
    VALUES ('ML', '601.475', 'Fall', 2021, 'ABCDEF');
/*standard account insert*/
INSERT INTO account (uName, email, accountPassword, phoneNumber)
    VALUES ('Chris Wilhelm', 'cwilhel8@jh.edu', 'Password1234', '410-867-5309');
/* repeat email, should fail */ /*Successfully failed!*/
INSERT INTO account (uName, email, accountPassword, phoneNumber)
    VALUES ('Alex Wei', 'cwilhel8@jh.edu', 'Password1234', '410-888-5309');
/* repeat phone number, should fail */ /*Successfully failed!*/
INSERT INTO account (uName, email, accountPassword, phoneNumber)
    VALUES ('Alex Wei', 'alex@jh.edu', 'Password1234', '410-867-5309');
/* real insertz for testing adding student and such */
INSERT INTO account (uName, email, accountPassword, phoneNumber)
    VALUES ('Alex Wei', 'alex@jh.edu', 'Password1234', '410-888-5309');
INSERT INTO account (uName, email, accountPassword, phoneNumber)
    VALUES ('Sam Ertman', 'sertman@jh.edu', 'Password1234', '410-888-8888');
/* will need to check that is not already oposite role in course on insert*/
INSERT INTO isStudent(courseId, accountId) VALUES (1, 4);
INSERT INTO isStaff(courseId, accountId, isInstructor) VALUES (1, 1, TRUE);
INSERT INTO isStaff(courseId, accountId, isInstructor) VALUES (1, 5, FALSE);
INSERT INTO officehour(startTime, endTime, recurringEvent, startDate, endDate, ohLocation, courseId)
    VALUES('11:00', '13:00', TRUE, '2022-01-01', '2022-12-31', 'Zoom', 1);
INSERT INTO isHost(officehourId, accountId) VALUES (1, 1);
INSERT INTO isHost(officehourId, accountId) VALUES (1, 5);
INSERT INTO isOnDayOfWeek (officeHourId, dayOfWeek) VALUES(1, 'Tuesday');
INSERT INTO isOnDayOfWeek (officeHourId, dayOfWeek) VALUEs(1, 'Thursday');
INSERT INTO isCancelled(officeHourId, cancelledDay) VALUEs(1, '2022-03-15');
SELECT createCourse('ML', '601.475', 'Fall', 2022, 'ABCDEG');
SELECT createAccount('Bob John', 'bob@gmail.com', '1234Password', '444-444-4444');
SELECT addStudent(3, 6);
SELECT addStaff(3, 1, TRUE);
SELECT createOfficeHour('15:00', '17:00', TRUE, '2022-08-01', '2022-12-15', 'Malone 128', 3);
SELECT createOfficeHour('12:00', '14:00', TRUE, '2022-08-01', '2022-12-15', 'Malone 128', 3, 10);
SELECT addDayOfWeek(2, 'Tuesday');
SELECT addDayOfWeek(3, 'Sunday');
SELECT addDayOfWeek(3, 'monday'); /* should fail b\c case sensitive*/
SELECT addHost(3, 1);
SELECT addHost(2, 1);
SELECT cancelOfficeHour(3, '2022-09-11');
SELECT createRegistration(4, '12:00', '13:00', '2022-03-10', 1);
SELECT createRegistration(4, '12:00', '13:00', '2022-09-18', 3);
SELECT addOfficeHourQuestions(1, 'How do I install heroku cli?');
SELECT addOfficeHourFeedback(2, 'This was fantastic, so helpful!');
SELECT isOfficeHoursOnDay(3, '2022-09-12');
SELECT isOfficeHoursOnDay(3, '2022-09-18');
SELECT isOfficeHoursCancelledOnDate(3, '2022-09-11');
SELECT isOfficeHoursCancelledOnDate(1, '2022-03-15');
SELECT cancelRegistration(2);
SELECT * FROM Registration R WHERE R.registrationId = 2;
SELECT validateOfficeHourId(1); /* true */
SELECT validateOfficeHourId(10); /* false */
SELECT validateCourseId(1); /* true */
SELECT validateCourseId(10);/* false */
SELECT studentIsNotAlreadyRegistered(3, '2022-09-18', 4); /* true */
SELECT studentIsNotAlreadyRegistered(3, '2022-09-18', 5);/* false */
SELECT studentIsNotAlreadyRegistered(1, '2022-03-10', 4);/* false */
SELECT studentIsNotAlreadyRegistered(1, '2022-03-10', 4);/* false */
SELECT isAccountStaff(1, 1); /* true */
SELECT isAccountStaff(1, 4); /* false */
SELECT isAccountStudent(1, 4); /* true */
SELECT isAccountStudent(1, 1); /* false */
SELECT isAccountHost(1, 1); /* true */
SELECT isAccountHost(1, 4); /* false */
SELECT updateUserPhoneNumber(1, '111-111-1111');
SELECT * FROM account as a WHERE a.accountId = 1;
SELECT updateUserPassword(1, 'passwordNew');
SELECT * FROM account as a WHERE a.accountId = 1;
SELECT getStudentCourses(4);
SELECT getStudentCourses(6);
SELECT getStudentCourses(1);
SELECT getStaffCourses(1);
SELECT getStaffCourses(5);
SELECT getStaffCourses(6);
SELECT getUser(1);
SELECT getOfficeHoursForCourse(1);
SELECT getCourseByCode('ABCDEG');
SELECT removeStudentFromCourse(6, 3);
SELECT removeStaffFromCourse(5, 1);
SELECT validateCourseCode('ABCDEF'); /*should be true*/
SELECT validateCourseCode('ABCDEG'); /*should be false*/
SELECT accountLogin('cwilhel8@jh.edu');