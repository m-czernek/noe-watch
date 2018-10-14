CREATE TABLE CLASS (
    ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    FQCN varchar(255) NOT NULL
);

INSERT INTO CLASS (FQCN) VALUES ("org.mysql");

CREATE TABLE TESTS (
    ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    CLASS_ID int NOT NULL,
    TEST_NAME varchar(255) NOT NULL,
    FOREIGN KEY (CLASS_ID) REFERENCES CLASS(ID)
);

INSERT INTO TESTS (ID, CLASS_ID, TEST_NAME) VALUES (0, 0, "myTest");

CREATE TABLE WINDOWS (
    ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    TEST_ID int NOT NULL,
    NUM_OF_FAILS int NOT NULL,
    INSERT_DATE DATE,
    LAST_SEEN_DATE DATE,
    FOREIGN KEY(TEST_ID) REFERENCES TESTS(ID)
);

INSERT INTO WINDOWS
(ID, TEST_ID, NUM_OF_FAILS, INSERT_DATE, LAST_SEEN_DATE)
values
(0,0,1,date('now'), date('now'));

SELECT 'Windows' as platform, w.NUM_OF_FAILS as failures, c.FQCN as class, t.TEST_NAME as test
FROM CLASS c
INNER JOIN TESTS t ON c.ID=t.CLASS_ID
INNER JOIN WINDOWS w ON w.TEST_ID=t.ID;
