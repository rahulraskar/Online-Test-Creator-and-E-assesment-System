CREATE DATABASE onlineQuiz;

CREATE TABLE admin (
    id INT PRIMARY KEY auto_increment, 
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    email VARCHAR(50),
    password VARCHAR(100),
    orgnizationType INT,
    orgnizationName VARCHAR(50),
    country VARCHAR(50),
    profileImage VARCHAR(100),
    activationToken VARCHAR(100),
    active INT
);

CREATE TABLE test(
    testId INT PRIMARY KEY auto_increment,
    testName VARCHAR(50),
    testDate DATE,
    testTime TIME,
    duration TIME,
    testType VARCHAR(50),
    totalMarks INT,
    passingMarks INT,
    noOfQuestions INT, 
    testStatus VARCHAR(50),
    groupId INT,
    FOREIGN KEY (groupId) references quizGroup(id)ON DELETE CASCADE,
    isActive INT DEFAULT 0,
    createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questionsTable (
    questId INT PRIMARY KEY auto_increment, 
    question TEXT,
    option_A  TEXT,
    option_B  TEXT,
    option_C  TEXT,	
    option_D  TEXT,	 
    correct_Ans VARCHAR(2),
    tag  VARCHAR(255),
    image VARCHAR(100),
    marks INT,	 
    testId INT,
    FOREIGN KEY (testId) references test(testId) ON DELETE CASCADE
);

CREATE TABLE discussion (
    discussionId INT PRIMARY KEY auto_increment,
    questId INT,
    FOREIGN KEY (questId) references questionsTable(questId) ON DELETE CASCADE,	
    userId INT,
    FOREIGN KEY (userId) references user(id) ON DELETE CASCADE,
    adminId INT,
    FOREIGN KEY (adminId) references admin(id), 
    query TEXT,
    response TEXT,
    testId INT,
    FOREIGN KEY (testId) references test(testId) ON DELETE CASCADE
);

CREATE TABLE quizGroup(
    id INT(11) PRIMARY KEY,
    groupName VARCHAR(100),
    createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    adminId int(11),
    FOREIGN KEY (adminId) REFERENCES admin(id)

);

//user-------------------------------------

CREATE TABLE user(
    id INT PRIMARY KEY auto_increment, 
    registrationCode VARCHAR(200),
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    email VARCHAR(50),
    password VARCHAR(100),
    country VARCHAR(50),
    profileImage VARCHAR(100), 
    groupId INT,
    FOREIGN KEY (groupId) references quizGroup(id) ON DELETE CASCADE,
    isActive INT DEFAULT 0,
    activationToken varchar(100)

);

CREATE TABLE userResult(
    id INT PRIMARY KEY auto_increment,
    testId INT,
    FOREIGN KEY (testId) references test(testId) ON DELETE CASCADE,
    isPresent INT DEFAULT 0,
    attemptedQuestions INT,
    correctAnswer INT,
    result VARCHAR(10),
    percentage FLOAT,
    marks INT,
    userID INT,
    FOREIGN KEY (userID) references user(id) ON DELETE CASCADE
);

CREATE TABLE userResponse(
    id INT PRIMARY KEY auto_increment,
    testId INT,
    FOREIGN KEY (testId) references test(testId) ON DELETE CASCADE,
    questionId INT,
    FOREIGN KEY (questionId) references questionsTable(questId)ON DELETE CASCADE,
    response VARCHAR(2),
    userId INT,
    FOREIGN KEY (userId) references user(id) ON DELETE CASCADE
);



//Comment**********************************************************

CREATE TABLE userTest(
    id INT PRIMARY KEY auto_increment,
    adminId INT,
    FOREIGN KEY (adminId) references admin(id),
    userId INT,
    FOREIGN KEY (userId) references user(id) ON DELETE CASCADE,	  
    testId INT,
    FOREIGN KEY (testId) references test(testId) ON DELETE CASCADE,
    reason TEXT,
    status VARCHAR(20)
);

//******************************************************************


