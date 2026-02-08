# Feature Specification: Combined CMS Specification

**Feature Branch**: `001-generate-single-combined`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Generate a single combined CMS specification from all use cases in Use Cases_Scenarios_ATs.md and all user stories in cms_user_stories.md. Treat each use case as a “feature” within the document: include a clearly labeled section per UC (UC-01 … UC-21) with requirements, validations, permissions, and failure handling. Do not invent requirements. Ensure traceability: each UC section references the corresponding user story IDs and acceptance tests."
**Authoritative Sources**: `cms_user_stories.md`, `Use Cases_Scenarios_ATs.md`  
**Terminology**: Use source terms verbatim; do not invent actors, permissions, or fields.  
**Ambiguities**: Mark as `NEEDS CLARIFICATION` and ask targeted questions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register Account (Priority: P1)

New users create a CMS account to gain access to registered-only CMS features (US-01).

**Why this priority**: Account creation is required before any authenticated CMS features can be used (US-01, UC-01).

**Independent Test**: Testable by completing UC-01 registration end-to-end without any other CMS features.

**Acceptance Scenarios**:

1. **Given** the user does not already have a CMS account, **When** the user submits the registration form with a valid unused email and a compliant password, **Then** the system creates the user account (AT-UC-01-01)
2. **Given** the registration form is displayed, **When** the user submits the form with an invalid email format, **Then** the system displays an email format error (AT-UC-01-02)

---

### User Story 2 - Log In (Priority: P1)

Registered users authenticate using their credentials to access their CMS dashboard (US-03).

**Why this priority**: Authentication gates access to all user-specific CMS capabilities (US-03, UC-03).

**Independent Test**: Testable by logging in with valid and invalid credentials per UC-03.

**Acceptance Scenarios**:

1. **Given** the user has a registered CMS account, **When** the user submits valid login credentials, **Then** the system authenticates the user (AT-UC-03-01)
2. **Given** the login form is displayed, **When** the user submits an email not registered in the system, **Then** the system rejects authentication (AT-UC-03-02)

---

### User Story 3 - Submit Paper (Priority: P1)

Authors submit a paper with metadata and a manuscript file for review (US-05, US-07).

**Why this priority**: Paper submission is the core entry point for the review workflow (US-05, UC-05).

**Independent Test**: Testable by completing a single submission with valid data and observing stored submission data.

**Acceptance Scenarios**:

1. **Given** the author is logged in and the submission period is open, **When** the author submits complete metadata and a compliant manuscript file, **Then** the system stores the submission metadata (AT-UC-05-01)
2. **Given** submission data is missing required fields, **When** the system performs validation, **Then** the system reports missing field errors (AT-UC-07-02)

---

### User Story 4 - Assign Reviewers (Priority: P2)

Editors assign reviewers to submitted papers and reviewers are notified (US-08, US-10).

**Why this priority**: Reviewer assignment enables the review process to begin (US-08, UC-08).

**Independent Test**: Testable by assigning a reviewer and confirming the notification is sent.

**Acceptance Scenarios**:

1. **Given** a submitted paper and eligible reviewers exist, **When** the editor assigns reviewers and confirms, **Then** the system stores the reviewer assignments (AT-UC-08-01)
2. **Given** reviewers are assigned to a paper, **When** the system sends notification emails, **Then** notification emails are sent to assigned reviewers (AT-UC-10-01)

---

### User Story 5 - Submit Review (Priority: P2)

Reviewers access assigned papers and submit completed review forms for editor evaluation (US-12, US-13).

**Why this priority**: Review submission produces the inputs needed for editorial decisions (US-12, UC-12).

**Independent Test**: Testable by submitting a review for one assigned paper and storing it for editor access.

**Acceptance Scenarios**:

1. **Given** the reviewer has an assigned paper and the review period is open, **When** the reviewer submits a completed review form, **Then** the system stores the review (AT-UC-12-01)
2. **Given** the review submission period has ended, **When** the reviewer attempts to submit a review, **Then** the system displays a submission closed error (AT-UC-12-03)

---

### User Story 6 - Publish Schedule (Priority: P3)

Administrators generate the conference schedule, editors resolve conflicts, and the schedule is published (US-16, US-17, US-18).

**Why this priority**: Publishing the schedule informs authors and attendees after decisions are made (US-18, UC-18).

**Independent Test**: Testable by generating and publishing a schedule for accepted papers.

**Acceptance Scenarios**:

1. **Given** a finalized conference schedule exists, **When** the system publishes the schedule, **Then** the schedule is published on the CMS webpage (AT-UC-18-01)
2. **Given** an editable schedule is displayed, **When** the editor introduces a scheduling conflict, **Then** the system displays a conflict error (AT-UC-17-02)

---

### User Story 7 - Register and Pay (Priority: P3)

Attendees view pricing, pay the registration fee, and receive confirmation and a ticket (US-19, US-20, US-21).

**Why this priority**: Registration and payment finalize attendance (US-20, UC-20).

**Independent Test**: Testable by completing a payment and receiving confirmation and ticket delivery.

**Acceptance Scenarios**:

1. **Given** the attendee is logged in and registration pricing exists, **When** the attendee submits valid payment information, **Then** the system records the payment (AT-UC-20-01)
2. **Given** an attendee completes registration payment, **When** the system processes confirmation and ticket delivery, **Then** the system sends a payment confirmation (AT-UC-21-01)

---

### Edge Cases

- Registration email format is invalid and the system displays an error (UC-01 extension 5a).
- Registration email is already in use and the system rejects the registration (UC-01 extension 5b).
- Password does not meet security requirements and the system displays requirements (UC-01 extension 6a).
- System cannot store a new account due to database/server error and displays failure (UC-01 extension 7a).
- Login credentials are invalid and access is denied (UC-03 extension 3a).
- Manuscript file fails validation (format/size) and submission is rejected (UC-07 extensions).
- Required submission fields are missing and validation errors are shown (UC-07 extension 2a/3a).
- Reviewer workload limit is exceeded and assignment is rejected (UC-09 extension 2a).
- Notification delivery fails and the system reports/records the failure (UC-10 extension 2a/3a).
- Review form is incomplete and submission is rejected (UC-12 extension 3a).
- Scheduling conflicts are detected and schedule generation/modification is blocked (UC-16/UC-17 extensions).
- Payment processing fails and the registration is not completed (UC-20 extensions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support UC-01 — Register User Account as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-01; ATs: AT-UC-01-01, AT-UC-01-02, AT-UC-01-03, AT-UC-01-04, AT-UC-01-05, AT-UC-01-06, AT-UC-01-07)
- **FR-002**: System MUST support UC-02 — Validate Registration Credentials as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-02; ATs: AT-UC-02-01, AT-UC-02-02, AT-UC-02-03, AT-UC-02-04, AT-UC-02-05, AT-UC-02-06)
- **FR-003**: System MUST support UC-03 — Log In User as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-03; ATs: AT-UC-03-01, AT-UC-03-02, AT-UC-03-03, AT-UC-03-04, AT-UC-03-05)
- **FR-004**: System MUST support UC-04 — Change Password as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-04; ATs: AT-UC-04-01, AT-UC-04-02, AT-UC-04-03, AT-UC-04-04, AT-UC-04-05, AT-UC-04-06, AT-UC-04-07, AT-UC-04-08)
- **FR-005**: System MUST support UC-05 — Submit Paper as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-05; ATs: AT-UC-05-01, AT-UC-05-02, AT-UC-05-03, AT-UC-05-04, AT-UC-05-05, AT-UC-05-06, AT-UC-05-07)
- **FR-006**: System MUST support UC-06 — Save Submission Draft as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-06; ATs: AT-UC-06-01, AT-UC-06-02, AT-UC-06-03, AT-UC-06-04, AT-UC-06-05)
- **FR-007**: System MUST support UC-07 — Validate Submission Data as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-07; ATs: AT-UC-07-01, AT-UC-07-02, AT-UC-07-03, AT-UC-07-04, AT-UC-07-05, AT-UC-07-06, AT-UC-07-07)
- **FR-008**: System MUST support UC-08 — Assign Reviewers as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-08; ATs: AT-UC-08-01, AT-UC-08-02, AT-UC-08-03, AT-UC-08-04, AT-UC-08-05, AT-UC-08-06, AT-UC-08-07)
- **FR-009**: System MUST support UC-09 — Enforce Reviewer Workload Limit as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-09; ATs: AT-UC-09-01, AT-UC-09-02, AT-UC-09-03, AT-UC-09-04)
- **FR-010**: System MUST support UC-10 — Notify Reviewers as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-10; ATs: AT-UC-10-01, AT-UC-10-02, AT-UC-10-03, AT-UC-10-04, AT-UC-10-05)
- **FR-011**: System MUST support UC-11 — Respond to Review Invitation as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-11; ATs: AT-UC-11-01, AT-UC-11-02, AT-UC-11-03, AT-UC-11-04, AT-UC-11-05)
- **FR-012**: System MUST support UC-12 — Submit Paper Review as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-12; ATs: AT-UC-12-01, AT-UC-12-02, AT-UC-12-03, AT-UC-12-04, AT-UC-12-05)
- **FR-013**: System MUST support UC-13 — Store and Forward Reviews as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-13; ATs: AT-UC-13-01, AT-UC-13-02, AT-UC-13-03, AT-UC-13-04, AT-UC-13-05)
- **FR-014**: System MUST support UC-14 — Make Accept/Reject Decision as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-14; ATs: AT-UC-14-01, AT-UC-14-02, AT-UC-14-03, AT-UC-14-04, AT-UC-14-05)
- **FR-015**: System MUST support UC-15 — Notify Authors as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-15; ATs: AT-UC-15-01, AT-UC-15-02, AT-UC-15-03, AT-UC-15-04, AT-UC-15-05)
- **FR-016**: System MUST support UC-16 — Generate Conference Schedule as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-16; ATs: AT-UC-16-01, AT-UC-16-02, AT-UC-16-03, AT-UC-16-04, AT-UC-16-05, AT-UC-16-06)
- **FR-017**: System MUST support UC-17 — Modify Conference Schedule as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-17; ATs: AT-UC-17-01, AT-UC-17-02, AT-UC-17-03, AT-UC-17-04, AT-UC-17-05)
- **FR-018**: System MUST support UC-18 — Publish Final Schedule as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-18; ATs: AT-UC-18-01, AT-UC-18-02, AT-UC-18-03, AT-UC-18-04, AT-UC-18-05)
- **FR-019**: System MUST support UC-19 — View Conference Pricing as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-19; ATs: AT-UC-19-01, AT-UC-19-02, AT-UC-19-03, AT-UC-19-04)
- **FR-020**: System MUST support UC-20 — Pay Registration Fee as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-20; ATs: AT-UC-20-01, AT-UC-20-02, AT-UC-20-03, AT-UC-20-04, AT-UC-20-05, AT-UC-20-06)
- **FR-021**: System MUST support UC-21 — Receive Payment Confirmation and Ticket as specified in `Use Cases_Scenarios_ATs.md`. (Traceability: US-21; ATs: AT-UC-21-01, AT-UC-21-02, AT-UC-21-03, AT-UC-21-04, AT-UC-21-05)

### Use Case Features

Each section below treats a use case as a feature and includes requirements, validations, permissions, and failure handling. No requirements beyond the authoritative sources are introduced.

### UC-01 — Register User Account
**Source User Story**: US-01 — As a new user, I want to register with my email and password so that I can access CMS features.
**Acceptance Tests**: AT-UC-01-01, AT-UC-01-02, AT-UC-01-03, AT-UC-01-04, AT-UC-01-05, AT-UC-01-06, AT-UC-01-07
**Primary Actor**: New User
**Secondary Actors**: CMS Database, Email System
**Trigger**: The user selects the “Register” option in the CMS.
**Requirements (Main Success Scenario)**:
1. The user selects the “Register” option.
2. The system displays the registration form requesting email and password.
3. The user enters an email address and password.
4. The user submits the registration form.
5. The system validates that the email address is correctly formatted and not already in use.
6. The system validates that the password meets password security standards.
7. The system creates the new user account and stores the user credentials in the CMS database.
8. The system confirms successful registration and redirects the user to the login screen.
**Validations**:
- 5. The system validates that the email address is correctly formatted and not already in use.
- 6. The system validates that the password meets password security standards.
**Permissions / Preconditions**:
- The user does not already have a CMS account.
- The CMS registration page is available.
**Failure Handling**:
- 5a: The email address is not correctly formatted. Outcome: The system displays an error message indicating the email format is invalid and prompts the user to correct it.
- 5b: The email address is already registered. Outcome: The system displays an error message indicating the email is already in use and prompts the user to use a different email or log in.
- 6a: The password does not meet security requirements. Outcome: The system displays an error message describing the password requirements and prompts the user to enter a new password.
- 7a: The system cannot store the new account due to a database or server error. Outcome: The system displays an error message indicating registration failed and advises the user to try again later.
- Failed End Condition: No user account is created, and the user remains unable to access registered-only CMS features.
- Success End Condition: A new user account is created and stored, and the user can proceed to log in to access CMS features.
### UC-02 — Validate Registration Credentials
**Source User Story**: US-02 — As the system, I want to validate email uniqueness and password strength so that user accounts are secure.
**Acceptance Tests**: AT-UC-02-01, AT-UC-02-02, AT-UC-02-03, AT-UC-02-04, AT-UC-02-05, AT-UC-02-06
**Primary Actor**: CMS
**Secondary Actors**: CMS Database, Password Policy Module
**Trigger**: The registration form is submitted with an email and password.
**Requirements (Main Success Scenario)**:
1. The system receives the submitted email and password from the registration process.
2. The system checks the email against the user database to determine whether the email is already in use.
3. The system evaluates the submitted password against the configured password security standards (minimum 8 characters, includes upper/lowercase letters, a number, and a symbol, and blocks common passwords).
4. The system returns a “valid” result to the registration process indicating the credentials can be used to create a new account.
**Validations**:
- 2. The system checks the email against the user database to determine whether the email is already in use.
- 3. The system evaluates the submitted password against the configured password security standards.
**Permissions / Preconditions**:
- The system has received an email and password from a registration attempt.
- The password security standard (policy) is configured and available.
- The user store (database) is reachable under normal operation.
**Failure Handling**:
- 2a: The email is already in use. Outcome: The system returns an “invalid” result indicating the email is not unique.
- 2b: The system cannot query the user database. Outcome: The system returns an “error” result indicating validation could not be completed reliably.
- 3a: The password does not meet security requirements. Outcome: The system returns an “invalid” result indicating the password is not acceptable.
- 3b: The password policy is unavailable or misconfigured. Outcome: The system returns an “error” result indicating password validation could not be completed reliably.
- Failed End Condition: The system determines the email is not unique and/or the password does not meet security standards, or the system cannot reliably complete validation.
- Success End Condition: The system determines the email is unique and the password meets security standards, and returns a “valid” result to the calling process.
### UC-03 — Log In User
**Source User Story**: US-03 — As a registered user, I want to log in using my credentials so that I can access my dashboard.
**Acceptance Tests**: AT-UC-03-01, AT-UC-03-02, AT-UC-03-03, AT-UC-03-04, AT-UC-03-05
**Primary Actor**: Registered User
**Secondary Actors**: CMS Authentication Service, CMS Database
**Trigger**: The user selects the “Log In” option on the CMS.
**Requirements (Main Success Scenario)**:
1. The user selects the “Log In” option.
2. The system displays the login form requesting email and password.
3. The user enters their registered email and password.
4. The user submits the login form.
5. The system validates the submitted credentials against stored user data.
6. The system authenticates the user.
7. The system redirects the user to their dashboard.
**Validations**:
- 5. The system validates the submitted credentials against stored user data.
**Permissions / Preconditions**:
- The user has a registered CMS account.
- The CMS login page is available.
**Failure Handling**:
- 5a: The email does not exist in the system. Outcome: The system rejects authentication and displays an error message indicating invalid credentials.
- 5b: The password is incorrect. Outcome: The system rejects authentication and displays an error message indicating invalid credentials.
- 5c: The authentication service or database is unavailable. Outcome: The system displays an error message indicating login cannot be completed at this time.
- Failed End Condition: The user is not authenticated and cannot access the dashboard.
- Success End Condition: The user is authenticated and redirected to their dashboard.
### UC-04 — Change Password
**Source User Story**: US-04 — As a registered user, I want to change my password so that I can maintain account security.
**Acceptance Tests**: AT-UC-04-01, AT-UC-04-02, AT-UC-04-03, AT-UC-04-04, AT-UC-04-05, AT-UC-04-06, AT-UC-04-07, AT-UC-04-08
**Primary Actor**: Registered User
**Secondary Actors**: CMS Authentication Service, CMS Database, Password Policy Module
**Trigger**: The user selects “Change Password” from their account settings.
**Requirements (Main Success Scenario)**:
1. The user navigates to account settings.
2. The user selects “Change Password.”
3. The system displays a change password form requesting the current password and a new password.
4. The user enters their current password and a new password.
5. The user submits the change password form.
6. The system validates the current password against the stored credentials.
7. The system validates the new password against the configured password security standards.
8. The system updates the user’s password in the database.
9. The system confirms the password was changed successfully.
**Validations**:
- 6. The system validates the current password against the stored credentials.
- 7. The system validates the new password against the configured password security standards.
**Permissions / Preconditions**:
- The user is logged in (authenticated).
- The account settings page is available.
**Failure Handling**:
- 6a: The current password is incorrect. Outcome: The system rejects the request and displays an error message indicating the current password is incorrect.
- 6b: The authentication service or database is unavailable during current password validation. Outcome: The system displays an error message indicating the password cannot be changed at this time.
- 7a: The new password does not meet security requirements. Outcome: The system rejects the request and displays an error message describing the password requirements.
- 7b: The password policy module is unavailable or misconfigured. Outcome: The system displays an error message indicating the password cannot be changed at this time.
- 8a: The system cannot update the password due to a database or server error. Outcome: The system displays an error message indicating the password change failed and advises the user to try again later.
- 5a: The user’s session is no longer valid (expired) at submission time. Outcome: The system redirects the user to the login page and does not change the password.
- Failed End Condition: The user’s password remains unchanged.
- Success End Condition: The user’s password is updated successfully and stored securely.
### UC-05 — Submit Paper
**Source User Story**: US-05 — As an author, I want to submit a paper with metadata and a manuscript file so that it can be reviewed.
**Acceptance Tests**: AT-UC-05-01, AT-UC-05-02, AT-UC-05-03, AT-UC-05-04, AT-UC-05-05, AT-UC-05-06, AT-UC-05-07
**Primary Actor**: Author
**Secondary Actors**: CMS Database, File Storage System
**Trigger**: The author selects the “Submit Paper” option in the CMS.
**Requirements (Main Success Scenario)**:
1. The author selects the “Submit Paper” option.
2. The system displays the paper submission form requesting required metadata and a manuscript file.
3. The author enters the required metadata (e.g., title, abstract, authors, keywords).
4. The author uploads a manuscript file.
5. The author submits the paper submission form.
6. The system validates that all required metadata fields are completed.
7. The system validates that the manuscript file meets format and size requirements.
8. The system stores the submission metadata in the CMS database.
9. The system stores the manuscript file in the file storage system.
10. The system confirms successful submission and marks the paper as submitted for review.
**Validations**:
- 6. The system validates that all required metadata fields are completed.
- 7. The system validates that the manuscript file meets format and size requirements.
**Permissions / Preconditions**:
- The author is registered and logged into the CMS.
- The submission period is open.
- The author has permission to submit papers.
**Failure Handling**:
- 3a: Required metadata fields are missing or incomplete. Outcome: The system displays an error message identifying missing metadata and prompts the author to complete the required fields.
- 4a: The manuscript file is missing. Outcome: The system displays an error message indicating that a manuscript file is required and prompts the author to upload a file.
- 7a: The manuscript file does not meet format or size requirements. Outcome: The system displays an error message describing acceptable file formats and size limits and prompts the author to upload a compliant file.
- 8a: The system cannot store submission data due to a database error. Outcome: The system displays an error message indicating submission failure and advises the author to try again later.
- 9a: The system cannot store the manuscript file due to a file storage error. Outcome: The system displays an error message indicating submission failure and advises the author to try again later.
- Failed End Condition: The paper submission is not stored, and the paper is not available for review.
- Success End Condition: The paper submission, including metadata and manuscript file, is successfully stored and marked as submitted for review.
### UC-06 — Save Submission Draft
**Source User Story**: US-06 — As an author, I want to save my paper submission progress so that I can complete it later.
**Acceptance Tests**: AT-UC-06-01, AT-UC-06-02, AT-UC-06-03, AT-UC-06-04, AT-UC-06-05
**Primary Actor**: Author
**Secondary Actors**: CMS Database, File Storage System
**Trigger**: The author selects the “Save Draft” option while working on a paper submission.
**Requirements (Main Success Scenario)**:
1. The author is working on a paper submission form.
2. The author selects the “Save Draft” option.
3. The system collects the currently entered metadata.
4. The system collects the currently uploaded manuscript file, if any.
5. The system validates that the draft contains sufficient information to be saved.
6. The system stores the draft metadata in the CMS database.
7. The system stores the manuscript file, if present, in the file storage system.
8. The system confirms that the draft has been saved successfully.
**Validations**:
- 5. The system validates that the draft contains sufficient information to be saved.
**Permissions / Preconditions**:
- The author is registered and logged into the CMS.
- The submission period is open.
- The author has permission to submit papers.
**Failure Handling**:
- 5a: The draft does not contain the minimum required information to be saved. Outcome: The system displays an error message indicating that required draft information is missing and prompts the author to add it.
- 6a: The system cannot store draft metadata due to a database error. Outcome: The system displays an error message indicating that the draft could not be saved and advises the author to try again later.
- 7a: The system cannot store the manuscript file due to a file storage error. Outcome: The system displays an error message indicating that the draft could not be saved and advises the author to try again later.
- Failed End Condition: The submission draft is not saved, and any unsaved progress is lost.
- Success End Condition: The submission draft is saved and can be retrieved and edited by the author at a later time.
### UC-07 — Validate Submission Data
**Source User Story**: US-07 — As the system, I want to validate file format, size, and form fields so that only valid submissions are accepted.
**Acceptance Tests**: AT-UC-07-01, AT-UC-07-02, AT-UC-07-03, AT-UC-07-04, AT-UC-07-05, AT-UC-07-06, AT-UC-07-07
**Primary Actor**: System
**Secondary Actors**: CMS Database, File Storage System
**Trigger**: A submission or draft save action is initiated by a user.
**Requirements (Main Success Scenario)**:
1. A submission or draft save action is initiated.
2. The system receives the submitted form fields and uploaded file data.
3. The system validates that all required form fields are present.
4. The system validates that all form field values meet defined constraints.
5. The system validates that uploaded files meet allowed format requirements (PDF, DOCX, or LaTeX ZIP; max 25 MB).
6. The system validates that uploaded files meet size limitations.
7. The system confirms that all validation checks pass.
8. The system allows the submission or draft save process to continue.
**Validations**:
- 3. The system validates that all required form fields are present.
- 4. The system validates that all form field values meet defined constraints.
- 5. The system validates that uploaded files meet allowed format requirements.
- 6. The system validates that uploaded files meet size limitations.
- 7. The system confirms that all validation checks pass.
**Permissions / Preconditions**:
- A user has initiated a submission or draft save action.
- Submission data and/or files have been provided to the system.
**Failure Handling**:
- 3a: One or more required form fields are missing. Outcome: The system reports a validation error identifying missing required fields and halts processing.
- 4a: One or more form field values violate constraints. Outcome: The system reports a validation error describing the invalid field values and halts processing.
- 5a: An uploaded file has an invalid format. Outcome: The system reports a validation error describing acceptable file formats and halts processing.
- 6a: An uploaded file exceeds the allowed size limit. Outcome: The system reports a validation error describing file size limits and halts processing.
- 7a: The system encounters an internal error during validation. Outcome: The system reports a validation failure and halts processing.
- Failed End Condition: Validation fails, and the submission or draft save process is halted with no data accepted.
- Success End Condition: All submitted form fields and files are validated successfully, allowing the submission or draft save process to proceed.
### UC-08 — Assign Reviewers
**Source User Story**: US-08 — As an editor, I want to assign reviewers to submitted papers so that each paper can be evaluated.
**Acceptance Tests**: AT-UC-08-01, AT-UC-08-02, AT-UC-08-03, AT-UC-08-04, AT-UC-08-05, AT-UC-08-06, AT-UC-08-07
**Primary Actor**: Editor
**Secondary Actors**: CMS Database, Reviewer Notification System
**Trigger**: The editor selects the “Assign Reviewers” option for a submitted paper.
**Requirements (Main Success Scenario)**:
1. The editor selects a submitted paper.
2. The editor selects the “Assign Reviewers” option.
3. The system displays a list of eligible reviewers.
4. The editor selects one or more reviewers for the paper.
5. The editor confirms the reviewer assignments.
6. The system validates that the selected reviewers are eligible and available.
7. The system stores the reviewer assignments in the CMS database.
8. The system notifies the assigned reviewers of their review assignments.
**Validations**:
- 6. The system validates that the selected reviewers are eligible and available.
**Permissions / Preconditions**:
- The editor is registered and logged into the CMS.
- The paper has been successfully submitted.
- Eligible reviewers exist in the system.
**Failure Handling**:
- 3a: No eligible reviewers are available. Outcome: The system displays a message indicating that no eligible reviewers are available and prevents assignment.
- 4a: The editor selects an invalid or duplicate reviewer. Outcome: The system displays an error message indicating the reviewer selection is invalid and prompts the editor to revise the selection.
- 6a: A selected reviewer is not eligible or exceeds workload limits. Outcome: The system displays an error message indicating the reviewer cannot be assigned and prompts the editor to choose a different reviewer.
- 7a: The system cannot store reviewer assignments due to a database error. Outcome: The system displays an error message indicating assignment failure and advises the editor to try again later.
- 8a: The system cannot notify reviewers due to a notification system error. Outcome: The system displays a warning indicating notifications failed while keeping the assignments recorded.
- Failed End Condition: No reviewers are assigned, and the paper remains unassigned for review.
- Success End Condition: One or more reviewers are successfully assigned to the selected paper, and the assignments are stored and communicated.
### UC-09 — Enforce Reviewer Workload Limit
**Source User Story**: US-09 — As the system, I want to prevent assigning more than five papers to a reviewer so that workload is fair.
**Acceptance Tests**: AT-UC-09-01, AT-UC-09-02, AT-UC-09-03, AT-UC-09-04
**Primary Actor**: System
**Secondary Actors**: CMS Database
**Trigger**: A reviewer assignment action is initiated for a paper.
**Requirements (Main Success Scenario)**:
1. A reviewer assignment action is initiated.
2. The system retrieves the current number of papers assigned to the selected reviewer.
3. The system verifies that the reviewer has fewer than five assigned papers.
4. The system allows the reviewer to be assigned to the paper.
5. The system updates the reviewer’s assignment count in the CMS database.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- A reviewer assignment action has been initiated.
- Reviewer workload data exists in the CMS.
**Failure Handling**:
- 3a: The reviewer already has five assigned papers. Outcome: The system prevents the assignment and reports a workload limit violation.
- 2a: The system cannot retrieve reviewer workload data due to a database error. Outcome: The system prevents the assignment and reports an assignment failure.
- Failed End Condition: The reviewer assignment is prevented due to workload limit violation, and no new assignment is made.
- Success End Condition: Reviewer workload limits are enforced, and only eligible reviewers with fewer than five assigned papers can be assigned.
### UC-10 — Notify Reviewers
**Source User Story**: US-10 — As the system, I want to notify reviewers by email so that they can accept or reject review assignments.
**Acceptance Tests**: AT-UC-10-01, AT-UC-10-02, AT-UC-10-03, AT-UC-10-04, AT-UC-10-05
**Primary Actor**: System
**Secondary Actors**: Email System, CMS Database
**Trigger**: Reviewer assignments are successfully created for a paper.
**Requirements (Main Success Scenario)**:
1. Reviewer assignments are created for a paper.
2. The system retrieves the email addresses of the assigned reviewers.
3. The system generates notification emails containing assignment details.
4. The system sends the notification emails to the assigned reviewers.
5. The system records that notification emails were successfully sent.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- Reviewer assignments have been successfully stored in the CMS.
- Reviewers have valid email addresses registered in the system.
**Failure Handling**:
- 2a: A reviewer does not have a valid email address on record. Outcome: The system skips notification for that reviewer and records a notification failure.
- 4a: The email system fails to send one or more notification emails. Outcome: The system records the notification failure and reports the issue for administrative review.
- 5a: The system cannot record notification status due to a database error. Outcome: The system reports a notification logging failure and advises administrative follow-up.
- Failed End Condition: Reviewers are not notified, and review assignments remain unacknowledged.
- Success End Condition: Reviewers are notified by email of their review assignments and can proceed to accept or reject them.
### UC-11 — Respond to Review Invitation
**Source User Story**: US-11 — As a reviewer, I want to accept or reject a review invitation so that I control my assigned workload.
**Acceptance Tests**: AT-UC-11-01, AT-UC-11-02, AT-UC-11-03, AT-UC-11-04, AT-UC-11-05
**Primary Actor**: Reviewer
**Secondary Actors**: CMS Database, Notification System
**Trigger**: The reviewer selects a review invitation from the CMS.
**Requirements (Main Success Scenario)**:
1. The reviewer accesses the list of pending review invitations.
2. The reviewer selects a review invitation.
3. The system displays the review assignment details and response options.
4. The reviewer selects either “Accept” or “Reject.”
5. The reviewer confirms their response.
6. The system records the reviewer’s response in the CMS database.
7. The system updates the review assignment status.
8. The system notifies the editor of the reviewer’s decision.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- The reviewer is registered and logged into the CMS.
- The reviewer has received at least one review invitation.
- The review invitation is still pending.
**Failure Handling**:
- 4a: The reviewer attempts to respond after the invitation has expired or been withdrawn. Outcome: The system displays an error message indicating the invitation is no longer valid and prevents response.
- 6a: The system cannot record the response due to a database error. Outcome: The system displays an error message indicating the response could not be saved and advises the reviewer to try again later.
- 8a: The system cannot notify the editor due to a notification system error. Outcome: The system displays a warning indicating notification failure while keeping the response recorded.
- Failed End Condition: The reviewer’s response is not recorded, and the review assignment remains unchanged.
- Success End Condition: The reviewer’s response is recorded, and the review assignment is updated accordingly.
### UC-12 — Submit Paper Review
**Source User Story**: US-12 — As a reviewer, I want to access assigned papers and submit a completed review form so that the editor can evaluate the paper.
**Acceptance Tests**: AT-UC-12-01, AT-UC-12-02, AT-UC-12-03, AT-UC-12-04, AT-UC-12-05
**Primary Actor**: Reviewer
**Secondary Actors**: CMS Database, File Storage System
**Trigger**: The reviewer selects an assigned paper to review.
**Requirements (Main Success Scenario)**:
1. The reviewer accesses the list of assigned papers.
2. The reviewer selects a paper to review.
3. The system displays the paper details and review form.
4. The reviewer completes the review form.
5. The reviewer submits the completed review.
6. The system validates that all required review fields are completed.
7. The system stores the completed review in the CMS database.
8. The system confirms successful review submission.
**Validations**:
- 6. The system validates that all required review fields are completed.
**Permissions / Preconditions**:
- The reviewer is registered and logged into the CMS.
- The reviewer has accepted a review assignment.
- The review submission period is open.
**Failure Handling**:
- 4a: The reviewer attempts to submit an incomplete review form. Outcome: The system displays an error message indicating required review fields are missing and prompts the reviewer to complete them.
- 5a: The review submission period has closed. Outcome: The system displays an error message indicating that reviews can no longer be submitted.
- 7a: The system cannot store the review due to a database error. Outcome: The system displays an error message indicating review submission failed and advises the reviewer to try again later.
- Failed End Condition: The review is not submitted, and the editor cannot access a completed review for the paper.
- Success End Condition: The completed review is successfully submitted and stored, and the editor can access it for evaluation.
### UC-13 — Store and Forward Reviews
**Source User Story**: US-13 — As the system, I want to store submitted reviews and forward them to the editor so that decisions can be made.
**Acceptance Tests**: AT-UC-13-01, AT-UC-13-02, AT-UC-13-03, AT-UC-13-04, AT-UC-13-05
**Primary Actor**: System
**Secondary Actors**: CMS Database, Editor Notification System
**Trigger**: A reviewer submits a completed review.
**Requirements (Main Success Scenario)**:
1. A completed review is submitted by a reviewer.
2. The system receives the submitted review data.
3. The system validates the integrity of the review submission.
4. The system stores the review in the CMS database.
5. The system associates the review with the correct paper and reviewer.
6. The system makes the stored review accessible to the editor.
7. The system confirms that the review has been successfully processed.
**Validations**:
- 3. The system validates the integrity of the review submission.
**Permissions / Preconditions**:
- A reviewer has submitted a completed review.
- The review submission period is open.
- The paper exists in the CMS.
**Failure Handling**:
- 3a: The submitted review data is incomplete or corrupted. Outcome: The system rejects the review and reports a submission error.
- 4a: The system cannot store the review due to a database error. Outcome: The system reports a storage failure and prevents the review from being recorded.
- 6a: The system cannot make the review accessible to the editor due to a system error. Outcome: The system reports an access failure and flags the review for administrative attention.
- Failed End Condition: The review is not stored or not accessible to the editor, preventing decision-making.
- Success End Condition: The submitted review is stored successfully and made accessible to the editor for evaluation.
### UC-14 — Make Accept/Reject Decision
**Source User Story**: US-14 — As an editor, I want to make an accept/reject decision once all reviews are submitted so that authors are informed.
**Acceptance Tests**: AT-UC-14-01, AT-UC-14-02, AT-UC-14-03, AT-UC-14-04, AT-UC-14-05
**Primary Actor**: Editor
**Secondary Actors**: CMS Database, Author Notification System
**Trigger**: All assigned reviews for a paper have been submitted.
**Requirements (Main Success Scenario)**:
1. The editor accesses the list of papers awaiting decisions.
2. The editor selects a paper.
3. The system displays the paper details and submitted reviews.
4. The editor selects either “Accept” or “Reject.”
5. The editor confirms the decision.
6. The system validates that all required reviews are present.
7. The system records the decision in the CMS database.
8. The system confirms that the decision has been successfully recorded.
**Validations**:
- 6. The system validates that all required reviews are present.
**Permissions / Preconditions**:
- The editor is registered and logged into the CMS.
- The paper has all required reviews submitted.
- The decision period is open.
**Failure Handling**:
- 2a: The selected paper does not have all required reviews submitted. Outcome: The system displays an error message indicating that a decision cannot be made until all reviews are submitted.
- 6a: The system cannot validate review completeness due to a system error. Outcome: The system displays an error message indicating validation failure and prevents decision recording.
- 7a: The system cannot store the decision due to a database error. Outcome: The system displays an error message indicating decision recording failed and advises the editor to try again later.
- Failed End Condition: No decision is recorded, and the authors are not informed of the paper’s outcome.
- Success End Condition: An accept or reject decision is recorded for the paper and can be communicated to the authors.
### UC-15 — Notify Authors
**Source User Story**: US-15 — As the system, I want to notify authors of acceptance or rejection so that they can plan accordingly.
**Acceptance Tests**: AT-UC-15-01, AT-UC-15-02, AT-UC-15-03, AT-UC-15-04, AT-UC-15-05
**Primary Actor**: System
**Secondary Actors**: Email System, CMS Database
**Trigger**: An accept or reject decision is recorded for a paper.
**Requirements (Main Success Scenario)**:
1. A decision is recorded for a paper.
2. The system retrieves the decision and associated author contact information.
3. The system generates a decision notification message for the authors.
4. The system sends the notification to the authors.
5. The system records that the notification was successfully sent.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- A decision has been recorded for the paper.
- Authors have valid contact information registered in the system.
**Failure Handling**:
- 2a: One or more authors do not have valid contact information. Outcome: The system skips notification for those authors and records a notification failure.
- 4a: The email system fails to deliver the notification. Outcome: The system records the notification failure and reports the issue for administrative review.
- 5a: The system cannot record notification status due to a database error. Outcome: The system reports a notification logging failure and advises administrative follow-up.
- Failed End Condition: Authors are not notified, and the decision is not communicated.
- Success End Condition: Authors are notified of the decision and can view the outcome for planning.
### UC-16 — Generate Conference Schedule
**Source User Story**: US-16 — As an administrator, I want the system to generate a conference schedule so that accepted papers are assigned times and rooms.
**Acceptance Tests**: AT-UC-16-01, AT-UC-16-02, AT-UC-16-03, AT-UC-16-04, AT-UC-16-05, AT-UC-16-06
**Primary Actor**: Administrator
**Secondary Actors**: CMS Database, Scheduling Engine
**Trigger**: The administrator selects the “Generate Schedule” option in the CMS.
**Requirements (Main Success Scenario)**:
1. The administrator selects the “Generate Schedule” option.
2. The system retrieves the list of accepted papers.
3. The system retrieves available rooms and time slots.
4. The system applies scheduling constraints to assign papers to rooms and time slots.
5. The system generates a complete schedule.
6. The system stores the generated schedule in the CMS database.
7. The system confirms that the schedule has been generated successfully.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- The administrator is registered and logged into the CMS.
- The list of accepted papers is finalized.
- Conference rooms and available time slots are defined in the system.
**Failure Handling**:
- 2a: No accepted papers are available for scheduling. Outcome: The system displays a message indicating there are no accepted papers to schedule and stops processing.
- 3a: No rooms or time slots are available. Outcome: The system displays an error message indicating scheduling resources are missing and stops processing.
- 4a: Scheduling constraints cannot be satisfied. Outcome: The system displays an error message indicating conflicts or constraints prevent schedule generation.
- 6a: The system cannot store the schedule due to a database error. Outcome: The system displays an error message indicating schedule generation failed and advises the administrator to try again later.
- Failed End Condition: No schedule is generated, and accepted papers remain unassigned to times or rooms.
- Success End Condition: A conference schedule is generated and stored, assigning accepted papers to times and rooms.
### UC-17 — Modify Conference Schedule
**Source User Story**: US-17 — As an editor, I want to modify the generated schedule so that conflicts and constraints are resolved.
**Acceptance Tests**: AT-UC-17-01, AT-UC-17-02, AT-UC-17-03, AT-UC-17-04, AT-UC-17-05
**Primary Actor**: Editor
**Secondary Actors**: CMS Database
**Trigger**: The editor selects the “Modify Schedule” option for an existing conference schedule.
**Requirements (Main Success Scenario)**:
1. The editor accesses the existing conference schedule.
2. The editor selects the “Modify Schedule” option.
3. The system displays the current schedule with editable time and room assignments.
4. The editor adjusts paper assignments to resolve conflicts or constraints.
5. The editor saves the modified schedule.
6. The system validates that the modified schedule satisfies required constraints.
7. The system stores the updated schedule in the CMS database.
8. The system confirms that the schedule has been successfully updated.
**Validations**:
- 6. The system validates that the modified schedule satisfies required constraints.
**Permissions / Preconditions**:
- The editor is registered and logged into the CMS.
- A conference schedule has already been generated.
- The schedule is editable.
**Failure Handling**:
- 4a: The editor introduces a new scheduling conflict. Outcome: The system displays an error message indicating the conflict and prevents saving.
- 6a: The modified schedule violates required constraints. Outcome: The system displays an error message indicating constraint violations and prevents saving.
- 7a: The system cannot store the modified schedule due to a database error. Outcome: The system displays an error message indicating schedule update failed and advises the editor to try again later.
- Failed End Condition: The schedule is not modified, and conflicts or constraints remain unresolved.
- Success End Condition: The schedule is successfully modified, stored, and reflects resolved conflicts and constraints.
### UC-18 — Publish Final Schedule
**Source User Story**: US-18 — As the system, I want to publish the final schedule to authors and the CMS webpage so that attendees are informed.
**Acceptance Tests**: AT-UC-18-01, AT-UC-18-02, AT-UC-18-03, AT-UC-18-04, AT-UC-18-05
**Primary Actor**: System
**Secondary Actors**: CMS Database, Web Publishing System, Author Notification System
**Trigger**: The conference schedule is marked as final.
**Requirements (Main Success Scenario)**:
1. The conference schedule is marked as final.
2. The system retrieves the finalized schedule.
3. The system publishes the schedule to the CMS webpage.
4. The system makes the schedule accessible to authors through the CMS.
5. The system confirms that the schedule has been successfully published.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- A conference schedule has been finalized and approved.
- The CMS webpage is available for publishing.
**Failure Handling**:
- 2a: The finalized schedule cannot be retrieved due to a system error. Outcome: The system reports a schedule retrieval failure and stops publishing.
- 3a: The system cannot publish the schedule to the CMS webpage due to a publishing error. Outcome: The system reports a publishing failure and stops processing.
- 4a: The system cannot make the schedule accessible to authors due to a system error. Outcome: The system reports an access failure and flags the issue for administrative review.
- Failed End Condition: The schedule is not published, and authors and attendees cannot access final scheduling information.
- Success End Condition: The final schedule is published on the CMS webpage and made available to authors.
### UC-19 — View Conference Pricing
**Source User Story**: US-19 — As a guest or registered user, I want to view conference pricing so that I know the cost of attendance.
**Acceptance Tests**: AT-UC-19-01, AT-UC-19-02, AT-UC-19-03, AT-UC-19-04
**Primary Actor**: Guest or Registered User
**Secondary Actors**: CMS Database
**Trigger**: The user selects the “View Pricing” option in the CMS.
**Requirements (Main Success Scenario)**:
1. The user selects the “View Pricing” option.
2. The system retrieves current conference pricing information.
3. The system displays pricing details to the user.
4. The user reviews the pricing information.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- The CMS pricing information exists.
- The CMS pricing page is available.
**Failure Handling**:
- 2a: Pricing information is not available. Outcome: The system displays a message indicating that pricing information is currently unavailable.
- 3a: The system encounters an error while retrieving pricing information. Outcome: The system displays an error message indicating pricing could not be retrieved and advises the user to try again later.
- Failed End Condition: Pricing information is not displayed, and the user cannot view attendance costs.
- Success End Condition: Conference pricing information is displayed to the user.
### UC-20 — Pay Registration Fee
**Source User Story**: US-20 — As an attendee, I want to pay the registration fee online so that I can attend the conference.
**Acceptance Tests**: AT-UC-20-01, AT-UC-20-02, AT-UC-20-03, AT-UC-20-04, AT-UC-20-05, AT-UC-20-06
**Primary Actor**: Attendee
**Secondary Actors**: Payment Gateway, CMS Database
**Trigger**: The attendee selects the “Pay Registration Fee” option in the CMS.
**Requirements (Main Success Scenario)**:
1. The attendee selects the “Pay Registration Fee” option.
2. The system displays the registration fee and payment options.
3. The attendee enters payment information.
4. The attendee submits the payment.
5. The system sends the payment information to the payment gateway.
6. The payment gateway confirms successful payment.
7. The system records the payment in the CMS database.
8. The system marks the attendee as registered.
**Validations**:
- Not specified in sources.
- Payment method must be supported (credit/debit card and PayPal).
**Permissions / Preconditions**:
- The attendee is registered and logged into the CMS.
- Registration pricing is defined.
- Online payment services are available.
**Failure Handling**:
- 3a: The attendee enters invalid or incomplete payment information. Outcome: The system displays an error message indicating invalid payment details and prompts the attendee to correct them.
- 6a: The payment gateway rejects the payment. Outcome: The system displays a payment failure message and prompts the attendee to try again or use a different payment method.
- 5a: The system cannot communicate with the payment gateway. Outcome: The system displays an error message indicating a payment service issue and advises the attendee to try again later.
- 7a: The system cannot record the payment due to a database error. Outcome: The system displays an error message indicating payment recording failed and advises the attendee to contact support.
- Failed End Condition: The payment is not completed, and the attendee is not registered.
- Success End Condition: The registration fee is successfully paid, and the attendee is marked as registered.
### UC-21 — Receive Payment Confirmation and Ticket
**Source User Story**: US-21 — As an attendee, I want to receive a payment confirmation and ticket so that I can prove my registration.
**Acceptance Tests**: AT-UC-21-01, AT-UC-21-02, AT-UC-21-03, AT-UC-21-04, AT-UC-21-05
**Primary Actor**: Attendee
**Secondary Actors**: Email System, CMS Database, Ticket Generation System
**Trigger**: A registration payment is successfully completed.
**Requirements (Main Success Scenario)**:
1. A registration payment is successfully completed.
2. The system generates a payment confirmation record.
3. The system generates a ticket for the attendee.
4. The system stores the confirmation and ticket in the CMS database.
5. The system sends the payment confirmation and ticket to the attendee.
6. The system confirms that the confirmation and ticket were successfully delivered.
**Validations**:
- Not specified in sources.
**Permissions / Preconditions**:
- The attendee has successfully completed registration payment.
- The attendee has valid contact information registered in the system.
**Failure Handling**:
- 3a: The system cannot generate a ticket due to a system error. Outcome: The system reports a ticket generation failure and prevents delivery.
- 4a: The system cannot store the confirmation or ticket due to a database error. Outcome: The system reports a storage failure and prevents delivery.
- 5a: The email system fails to deliver the confirmation or ticket. Outcome: The system records a delivery failure and advises administrative follow-up.
- Failed End Condition: The attendee does not receive a confirmation or ticket and cannot prove registration.
- Success End Condition: The attendee receives a payment confirmation and a ticket, and the ticket is available for proof of registration.

### Key Entities *(include if feature involves data)*

- **User Account**: Registered user identity (email, password) used for authentication and access.
- **Paper Submission**: Metadata and manuscript file submitted by an author.
- **Review Assignment**: Association between a paper and a reviewer.
- **Review**: Completed review form submitted by a reviewer.
- **Editorial Decision**: Accept/reject outcome for a paper.
- **Conference Schedule**: Time and room assignments for accepted papers.
- **Conference Pricing**: Published registration fee information.
- **Registration Payment**: Attendee payment record for conference registration.
- **Ticket/Confirmation**: Proof of successful registration payment.

### Assumptions and Deferred Details

- Password security standards (e.g., minimum length, complexity, blacklist rules) are referenced but not fully specified in the SRS.
- Account lockout and retry limits are not specified in the SRS.
- Whether the user must re-authenticate after a password change is not specified in the SRS.
- Manuscript file format and size limits are referenced but not fully specified in the SRS.
- Minimum required information for saving a draft is referenced but not fully specified in the SRS.
- Validation rules for file formats, size limits, and field constraints are referenced but not fully specified in the SRS.
- Reviewer eligibility rules and workload limit variations are not fully specified in the SRS.
- Retry policies and escalation for failed notifications are not fully specified in the SRS.
- Invitation expiration timing and reminder policies are not fully specified in the SRS.
- Review form structure and required fields are referenced but not fully specified in the SRS.
- Timing/method of notifying editors about new reviews are not fully specified in the SRS.
- Decision criteria and tie-breaking rules are referenced but not fully specified in the SRS.
- Notification timing, retries, and whether notifications include review feedback are not fully specified in the SRS.
- Scheduling constraints and conflict resolution rules are not fully specified in the SRS.
- Editable constraints and conflict detection rules for schedule edits are not fully specified in the SRS.
- Whether notifications are sent to authors upon schedule publication is not fully specified in the SRS.
- Whether pricing varies by attendee type or registration period is not fully specified in the SRS.
- Supported payment methods and refund policies are not fully specified in the SRS.
- Ticket format, QR code usage, and re-delivery policies are not fully specified in the SRS.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Each UC-01 through UC-21 main success scenario can be executed end-to-end with its corresponding acceptance tests passing.
- **SC-002**: Each failure path documented in the acceptance tests results in the specified error handling without creating partial or inconsistent records.
- **SC-003**: Authors can complete a full submission (UC-05) and reviewers can complete a full review (UC-12) in one uninterrupted session without encountering validation errors when inputs are valid.
- **SC-004**: The published schedule (UC-18) is available to authors and the CMS webpage after generation and modification steps complete.
- **SC-005**: Attendees who complete payment (UC-20) receive confirmation and a ticket (UC-21) as specified in acceptance tests.
