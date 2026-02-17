PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT,
  abstract TEXT,
  authors TEXT,
  keywords TEXT,
  manuscript_file TEXT,
  status TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS review_assignments (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invitation_responses (
  id INTEGER PRIMARY KEY,
  review_assignment_id INTEGER NOT NULL,
  response TEXT NOT NULL,
  FOREIGN KEY (review_assignment_id) REFERENCES review_assignments(id)
);

CREATE TABLE IF NOT EXISTS reviewer_notifications (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  review_assignment_id INTEGER NOT NULL,
  review_form TEXT NOT NULL,
  FOREIGN KEY (review_assignment_id) REFERENCES review_assignments(id)
);

CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL,
  decision_outcome TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

CREATE TABLE IF NOT EXISTS author_notifications (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS schedule_items (
  id INTEGER PRIMARY KEY,
  submission_id INTEGER NOT NULL,
  time_assignment TEXT NOT NULL,
  room_assignment TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

CREATE TABLE IF NOT EXISTS pricing (
  id INTEGER PRIMARY KEY,
  registration_fee TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  payment_information TEXT NOT NULL,
  payment_confirmation TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ticket_details TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
