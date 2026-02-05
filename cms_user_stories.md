# Conference Management System (CMS)
## User Stories

This document contains the extracted user stories from the IEEE 830 Software Requirements Specification (SRS) for the Conference Management System (CMS).

---

## Actors
- Guest (Public User)
- Author
- Reviewer / Referee
- Editor
- Administrator
- Attendee

---

## User Registration & Authentication

- **US-01**: As a new user, I want to register with my email and password so that I can access CMS features.
- **US-02**: As the system, I want to validate email uniqueness and password strength so that user accounts are secure.
- **US-03**: As a registered user, I want to log in using my credentials so that I can access my dashboard.
- **US-04**: As a registered user, I want to change my password so that I can maintain account security.

---

## Paper Submission (Author)

- **US-05**: As an author, I want to submit a paper with metadata and a manuscript file so that it can be reviewed.
- **US-06**: As an author, I want to save my paper submission progress so that I can complete it later.
- **US-07**: As the system, I want to validate file format, size, and form fields so that only valid submissions are accepted.

---

## Referee Assignment (Editor)

- **US-08**: As an editor, I want to assign reviewers to submitted papers so that each paper can be evaluated.
- **US-09**: As the system, I want to prevent assigning more than five papers to a reviewer so that workload is fair.
- **US-10**: As the system, I want to notify reviewers by email so that they can accept or reject review assignments.

---

## Paper Reviewing (Reviewer & Editor)

- **US-11**: As a reviewer, I want to accept or reject a review invitation so that I control my assigned workload.
- **US-12**: As a reviewer, I want to access assigned papers and submit a completed review form so that the editor can evaluate the paper.
- **US-13**: As the system, I want to store submitted reviews and forward them to the editor so that decisions can be made.
- **US-14**: As an editor, I want to make an accept/reject decision once all reviews are submitted so that authors are informed.
- **US-15**: As the system, I want to notify authors of acceptance or rejection so that they can plan accordingly.

---

## Scheduling (Administrator / Editor)

- **US-16**: As an administrator, I want the system to generate a conference schedule so that accepted papers are assigned times and rooms.
- **US-17**: As an editor, I want to modify the generated schedule so that conflicts and constraints are resolved.
- **US-18**: As the system, I want to publish the final schedule to authors and the CMS webpage so that attendees are informed.

---

## Conference Registration & Payment (Attendee)

- **US-19**: As a guest or registered user, I want to view conference pricing so that I know the cost of attendance.
- **US-20**: As an attendee, I want to pay the registration fee online so that I can attend the conference.
- **US-21**: As an attendee, I want to receive a payment confirmation and ticket so that I can prove my registration.

---

*End of document.*

