PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0001_initial_schema.sql','2026-02-23 10:47:35');
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "users" VALUES('usr_1771843726590_cl4nmmdk','rtmea84@gmail.com','d17c89154ea503a1c697bc5c6084f770c6a50dab1ef657ed1e77166867482b0f','Taha rana','user',NULL,'2026-02-23 10:48:46','2026-02-23 10:48:46');
CREATE TABLE resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  raw_text TEXT,
  parsed_data TEXT, 
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO "resumes" VALUES('res_1771845791227_48avo6ou','usr_1771843726590_cl4nmmdk','taha rana',replace('TAHA RANA\nF R O N T - E N D D E V E L O P E R\nI’ma Frontend Developer skilled in HTML,CSS, JavaScript, GSAP,\nThreejs, Reactjs and React 3 Fibre focused on creating responsive,\ninteractive, and visually engaging web experiences. I''m currently\nexpanding my expertise into backend technologies like Node.js and\nExpress to grow as a full-stack developer.\nE X P E R I E N C E\n2024 - Present\nFRONT-END DEVELOPER\nCREATIVE FRONTEND DEVELOPER\nWORDPRESS DESIGNER\nHTML\nCSS\nJS\nWORDPRESS\nREACT-JS\n3JS\nREACT-THREE-FIBER\nGSAP\nNODE-JS\nEXPRESS-JS\nMONGODB\nSQL\nPYTHON\nS K I L L S\nE D U C A T I O N\nSINDH MEDRASSAT UL ISLAM(SMIU)\nBSCS 6 SEMESTER\n2023 - PRESENT\nPre Engineering\n2021 - 2022 SM COLLEGE\nP R O F I L E\nP R O J E C T S\n03333277347\nHBCHS,NAVAL COLONY\nKARACHI\nrtmea84@gmail.com\nhttps://taha-rana.vercel.app/\nhttps://www.linkedin.com/in/taharana-creative-frontend-developer/\nMY PORTFOLIO (https://taha-rana.vercel.app/\nE-COMMERCE WEBSITE(https://tcom-market-pro.vercel.app/)\nSPYLT - ANIMATED WEBSITE FOR DRINKING\nBRAND(https://spylt-gamma.vercel.app/)\n3D PLANET MOVING ON SCROLLING\n(https://res.cloudinary.com/deam3wdrx/video/upload/v175594279\n4/Vite_React_-_Google_Chrome_2025-08-23_14-16-\n47_1_gazbex.mp4)\nFANTA CAN MOVING ON SCROLLING\n(https://res.cloudinary.com/deam3wdrx/video/upload/v175527670\n3/fanta_eeiat9.mp4)\nANIMATED HOSPITAL WEBSITE CREATED FOR INDIAN CLIENT\n(https://res.cloudinary.com/deam3wdrx/video/upload/v175527671\n6/Radhe-Krishna_-_Google_Chrome_2025-04-03_22-54-\n43_2_bf5zbd.mp4)\nSEE MORE\nhttps://taha-rana.vercel.app/','\n',char(10)),'{"name":"TAHA RANA","email":"rtmea84@gmail.com","summary":"A Frontend Developer skilled in HTML, CSS, JavaScript, GSAP, Three.js, React.js, and React Three Fibre, focused on creating responsive, interactive, and visually engaging web experiences. Currently expanding expertise into backend technologies like Node.js and Express to grow as a full-stack developer.","skills":["HTML","CSS","JavaScript","GSAP","Three.js","React.js","React Three Fibre","Node.js","Express.js","MongoDB","SQL","Python","WordPress"],"experience":[{"title":"FRONT-END DEVELOPER / CREATIVE FRONTEND DEVELOPER / WORDPRESS DESIGNER","company":null,"duration":"2024 - Present","highlights":[]}],"education":[{"degree":"BSCS (6th Semester)","institution":"SINDH MADRASSAT UL ISLAM UNIVERSITY (SMIU)","year":"Present"},{"degree":"Pre Engineering","institution":"SM COLLEGE","year":"2022"}],"projects":[{"name":"MY PORTFOLIO","description":"Personal portfolio website.","technologies":[]},{"name":"E-COMMERCE WEBSITE","description":"An e-commerce platform.","technologies":[]},{"name":"SPYLT - ANIMATED WEBSITE FOR DRINKING BRAND","description":"An animated website for a drinking brand.","technologies":[]},{"name":"3D PLANET MOVING ON SCROLLING","description":"A web project featuring a 3D planet animation triggered by scrolling.","technologies":[]},{"name":"FANTA CAN MOVING ON SCROLLING","description":"A web project featuring an animated Fanta can triggered by scrolling.","technologies":[]},{"name":"ANIMATED HOSPITAL WEBSITE CREATED FOR INDIAN CLIENT","description":"An animated hospital website developed for an Indian client.","technologies":[]}],"certifications":[],"years_of_experience":0,"expertise_level":"junior"}','2026-02-23 11:23:11');
INSERT INTO "resumes" VALUES('res_1771851341533_blchnst7','usr_1771843726590_cl4nmmdk','My Resume',replace('taha rana \nhtml css js gsap','\n',char(10)),'{"name":"taha rana","email":"","summary":"","skills":["html","css","js","gsap"],"experience":[],"education":[],"projects":[],"certifications":[],"years_of_experience":0,"expertise_level":"junior"}','2026-02-23 12:55:41');
CREATE TABLE interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resume_id TEXT,
  type TEXT DEFAULT 'technical' CHECK(type IN ('technical', 'hr', 'behavioral', 'mixed')),
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'cancelled')),
  language TEXT DEFAULT 'en',
  total_score REAL DEFAULT 0,
  communication_score REAL DEFAULT 0,
  technical_score REAL DEFAULT 0,
  confidence_score REAL DEFAULT 0,
  clarity_score REAL DEFAULT 0,
  overall_feedback TEXT,
  strengths TEXT, 
  weaknesses TEXT, 
  improvements TEXT, 
  duration_seconds INTEGER DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);
INSERT INTO "interviews" VALUES('int_1771843804770_9fierapy','usr_1771843726590_cl4nmmdk',NULL,'hr','completed','en',4.6,3,5,5.5,5,'Average performance with an average score of 4.6/10. While you demonstrated some foundational knowledge, there are several areas that would benefit from focused practice. Review the suggestions below and practice regularly to improve.','["Showed willingness to participate in the interview process"]','["Communication could be more structured and detailed","Several questions were skipped"]','["Practice explaining concepts using the STAR method (Situation, Task, Action, Result)","Review core technical concepts and practice explaining them concisely","Build confidence by practicing common interview questions aloud","Structure answers with clear introduction, body, and conclusion","Continue practicing with mock interviews to build comfort and fluency"]',0,'2026-02-23 10:50:04','2026-02-23 10:51:17');
INSERT INTO "interviews" VALUES('int_1771850565709_zzqnqgyo','usr_1771843726590_cl4nmmdk','res_1771845791227_48avo6ou','behavioral','completed','en',3,2.5,3,3.5,2.5,'The candidate provided a single relevant response to a technical question about learning MongoDB and JWT authentication for a React + Node project. The approach described was methodical, involving official documentation, video tutorials, and practical implementation. However, the response lacked depth in explaining specific challenges and solutions. The candidate failed to answer 9 out of 10 questions, with one response being completely inappropriate and unprofessional. This demonstrates poor communication skills, lack of preparation, and inability to handle behavioral questions. The technical knowledge shown was basic and did not demonstrate problem-solving abilities or depth of understanding.','["Basic understanding of learning new technologies","Practical approach to implementation"]','["Inability to answer most questions","Unprofessional language used","Lack of depth in technical explanations","Poor communication skills","No demonstration of problem-solving abilities"]','["Prepare for behavioral questions thoroughly","Maintain professional communication","Provide detailed examples with specific challenges and solutions","Practice explaining technical concepts clearly","Develop better time management for interview responses"]',0,'2026-02-23 12:42:45','2026-02-23 12:45:59');
CREATE TABLE interview_questions (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'technical' CHECK(question_type IN ('technical', 'behavioral', 'hr', 'situational', 'project')),
  difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'hard')),
  order_num INTEGER NOT NULL,
  answer_text TEXT,
  answer_audio_url TEXT,
  score REAL DEFAULT 0,
  feedback TEXT,
  communication_score REAL DEFAULT 0,
  technical_score REAL DEFAULT 0,
  confidence_score REAL DEFAULT 0,
  clarity_score REAL DEFAULT 0,
  asked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);
INSERT INTO "interview_questions" VALUES('q_1771843804805_pngxc7wr','int_1771843804770_9fierapy','What are your greatest strengths?','hr','easy',1,'I would like to skip this question.',NULL,4.6,'Decent attempt. To improve: Try to elaborate more on your points; Be more assertive in your responses; Structure your answer with clear steps or examples.',3,5,5.5,5,'2026-02-23 10:50:04','2026-02-23 10:50:43');
INSERT INTO "interview_questions" VALUES('q_1771843843665_0einp817','int_1771843804770_9fierapy','What Python frameworks have you used and what are their tradeoffs?','hr','medium',2,'I would like to skip this question.',NULL,4.6,'Decent attempt. To improve: Try to elaborate more on your points; Be more assertive in your responses; Structure your answer with clear steps or examples.',3,5,5.5,5,'2026-02-23 10:50:43','2026-02-23 10:51:15');
INSERT INTO "interview_questions" VALUES('q_1771843873358_34efq0r8','int_1771843804770_9fierapy','How do you manage state in a large React application? Compare different approaches.','hr','medium',3,'I would like to skip this question.',NULL,4.6,'Decent attempt. To improve: Try to elaborate more on your points; Be more assertive in your responses; Structure your answer with clear steps or examples.',3,5,5.5,5,'2026-02-23 10:51:13','2026-02-23 10:51:16');
INSERT INTO "interview_questions" VALUES('q_1771843875244_plukmizt','int_1771843804770_9fierapy','Explain the event loop in Node.js and how it handles asynchronous operations.','hr','medium',4,'I would like to skip this question.',NULL,4.6,'Decent attempt. To improve: Try to elaborate more on your points; Be more assertive in your responses; Structure your answer with clear steps or examples.',3,5,5.5,5,'2026-02-23 10:51:15','2026-02-23 10:51:16');
INSERT INTO "interview_questions" VALUES('q_1771843875526_dcd7ee8g','int_1771843804770_9fierapy','What''s your experience with database indexing strategies?','hr','medium',5,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 10:51:15',NULL);
INSERT INTO "interview_questions" VALUES('q_1771843875691_lai8nvee','int_1771843804770_9fierapy','What''s your experience with database indexing strategies?','hr','medium',6,'I would like to skip this question.',NULL,4.6,'Decent attempt. To improve: Try to elaborate more on your points; Be more assertive in your responses; Structure your answer with clear steps or examples.',3,5,5.5,5,'2026-02-23 10:51:15','2026-02-23 10:51:17');
INSERT INTO "interview_questions" VALUES('q_1771843876517_k0gzsf88','int_1771843804770_9fierapy','How do you optimize slow SQL queries? Walk me through your process.','hr','medium',7,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 10:51:16',NULL);
INSERT INTO "interview_questions" VALUES('q_1771843876746_4hyb62gk','int_1771843804770_9fierapy','What''s your approach to work-life balance?','hr','medium',8,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 10:51:16',NULL);
INSERT INTO "interview_questions" VALUES('q_1771850569649_70u5rt8m','int_1771850565709_zzqnqgyo','Tell me about a time when you had to learn a new technology or programming language quickly for a project. How did you approach the learning process and what challenges did you face?','behavioral','medium',1,replace('Mujhe React + Node project ke liye MongoDB + JWT auth fast seekhna para.\n\nApproach:\n\nOfficial docs + short YouTube crash course\n\nSmall demos banaye\n\nReal project mai directly implement kiya\n\nChallenges:\n\nAsync flow\n\nToken handling\n\nError debugging\n\nResult:\n2–3 din mai working authentication + CRUD system bana liya.','\n',char(10)),NULL,6,'The candidate demonstrates a practical approach to learning new technologies quickly, using official documentation and hands-on practice. The technical content shows understanding of key concepts like async flow, token handling, and error debugging. However, the response could be more detailed about specific challenges faced and how they were overcome. The communication is somewhat informal and could benefit from more structured explanation of the learning process. The confidence level is good, showing comfort with the subject matter. To improve, the candidate should provide more specific examples of challenges and solutions, and explain their thought process more clearly.',5,6,7,5,'2026-02-23 12:42:49','2026-02-23 12:45:14');
INSERT INTO "interview_questions" VALUES('q_1771850667610_wm1wfsgm','int_1771850565709_zzqnqgyo','Describe a situation where you had to work on a project with a tight deadline. How did you prioritize tasks and ensure timely delivery?','behavioral','medium',2,'nooo,fuck uu',NULL,0,'The response is completely inappropriate and unprofessional. It does not address the question at all and contains offensive language. This is not an acceptable answer in any professional setting. The candidate should be advised to provide a thoughtful, professional response that demonstrates their ability to handle tight deadlines and prioritize tasks effectively.',0,0,0,0,'2026-02-23 12:44:27','2026-02-23 12:45:20');
INSERT INTO "interview_questions" VALUES('q_1771850717395_aayzkg0r','int_1771850565709_zzqnqgyo','Tell me about a time when you had to debug a complex issue in a web application. What steps did you take to identify and resolve the problem?','behavioral','medium',3,'[Skipped]',NULL,0,'Question skipped by user.',0,0,0,0,'2026-02-23 12:45:17','2026-02-23 12:45:32');
INSERT INTO "interview_questions" VALUES('q_1771850724579_44jhxeo5','int_1771850565709_zzqnqgyo','Tell me about a time when you had to collaborate with a team member who had a different working style or approach. How did you handle the situation and ensure effective collaboration?','behavioral','medium',4,'[Skipped]',NULL,0,'Question skipped by user.',0,0,0,0,'2026-02-23 12:45:24','2026-02-23 12:45:36');
INSERT INTO "interview_questions" VALUES('q_1771850741207_61yh9eer','int_1771850565709_zzqnqgyo','Tell me about a time when you had to handle multiple projects or tasks simultaneously. How did you manage your time and ensure all deliverables were met?','behavioral','easy',5,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 12:45:41',NULL);
INSERT INTO "interview_questions" VALUES('q_1771850741308_4ae2gel2','int_1771850565709_zzqnqgyo','Tell me about a time when you had to learn a new technology or programming language quickly for a project. How did you approach the learning process and what challenges did you face?','behavioral','medium',5,'[Skipped]',NULL,0,'Question skipped by user.',0,0,0,0,'2026-02-23 12:45:41','2026-02-23 12:45:43');
INSERT INTO "interview_questions" VALUES('q_1771850745878_i20l3qz4','int_1771850565709_zzqnqgyo','Tell me about a time when you had to handle multiple projects or tasks simultaneously. How did you manage your time and ensure all deliverables were met?','behavioral','medium',7,'[Skipped]',NULL,0,'Question skipped by user.',0,0,0,0,'2026-02-23 12:45:45','2026-02-23 12:45:47');
INSERT INTO "interview_questions" VALUES('q_1771850749177_jxon9tug','int_1771850565709_zzqnqgyo','Tell me about a time when you had to handle multiple projects or tasks simultaneously. How did you manage your time and ensure all deliverables were met?','behavioral','easy',7,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 12:45:49',NULL);
INSERT INTO "interview_questions" VALUES('q_1771850749318_k2wrp8th','int_1771850565709_zzqnqgyo','Tell me about a time when you had to explain a technical concept to a non-technical stakeholder. How did you ensure they understood the key points?','behavioral','medium',7,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 12:45:49',NULL);
INSERT INTO "interview_questions" VALUES('q_1771850749557_jtgnsufc','int_1771850565709_zzqnqgyo','Tell me about a time when you had to debug a complex issue in a web application. What steps did you take to identify and resolve the problem?','behavioral','medium',7,'[Skipped]',NULL,0,'Question skipped by user.',0,0,0,0,'2026-02-23 12:45:49','2026-02-23 12:45:51');
INSERT INTO "interview_questions" VALUES('q_1771850751974_xx2kyh5i','int_1771850565709_zzqnqgyo','Tell me about a time when you had to work on a project with a tight deadline. How did you prioritize tasks and ensure timely delivery?','behavioral','easy',8,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 12:45:51',NULL);
INSERT INTO "interview_questions" VALUES('q_1771850754031_uw2mu8ga','int_1771850565709_zzqnqgyo','Tell me about a time when you had to debug a complex issue in a web application. What steps did you take to identify and resolve the problem?','behavioral','medium',8,NULL,NULL,0,NULL,0,0,0,0,'2026-02-23 12:45:54',NULL);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',1);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_interviews_user ON interviews(user_id);
CREATE INDEX idx_questions_interview ON interview_questions(interview_id);