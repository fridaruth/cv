-- tabellstruktur för kurser
 DROP TABLE IF EXISTS courses;

            CREATE TABLE courses (
            id SERIAL PRIMARY KEY,
            coursecode TEXT NOT NULL,
            coursename TEXT NOT NULL,
            syllabus TEXT NOT NULL,
            progression CHAR(1) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )