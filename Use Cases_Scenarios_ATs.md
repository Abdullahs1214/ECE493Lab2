# UC-01 — Register User Account

## Source User Story
**US-01**: As a new user, I want to register with my email and password so that I can access CMS features.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow a new user to create an account in the Conference Management System so they can access CMS features.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: New User  
**Secondary Actors**: CMS Database, Email System  
**Trigger**: The user selects the “Register” option in the CMS.

### Success End Condition
* A new user account is created and stored, and the user can proceed to log in to access CMS features.

### Failed End Condition
* No user account is created, and the user remains unable to access registered-only CMS features.

### Preconditions
* The user does not already have a CMS account.
* The CMS registration page is available.

### Main Success Scenario
1. The user selects the “Register” option.
2. The system displays the registration form requesting email and password.
3. The user enters an email address and password.
4. The user submits the registration form.
5. The system validates that the email address is correctly formatted and not already in use.
6. The system validates that the password meets password security standards.
7. The system creates the new user account and stores the user credentials in the CMS database.
8. The system confirms successful registration and redirects the user to the login screen.

### Extensions
* **5a**: The email address is not correctly formatted.  
  * **5a1**: The system displays an error message indicating the email format is invalid and prompts the user to correct it.
* **5b**: The email address is already registered.  
  * **5b1**: The system displays an error message indicating the email is already in use and prompts the user to use a different email or log in.
* **6a**: The password does not meet security requirements.  
  * **6a1**: The system displays an error message describing the password requirements and prompts the user to enter a new password.
* **7a**: The system cannot store the new account due to a database or server error.  
  * **7a1**: The system displays an error message indicating registration failed and advises the user to try again later.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Exact password security standards are referenced but not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A new user visits the Conference Management System homepage and decides to register in order to access conference features. The user selects the **Register** option, and the system presents a registration form requesting an email address and password.

The user enters a valid, unused email address and a password that meets the system’s security requirements, then submits the form. The system verifies the email format and checks that the email is not already registered. It also validates that the password satisfies security standards.

After successful validation, the system securely stores the user’s credentials in the CMS database. The system confirms that registration was successful and redirects the user to the login screen so they may authenticate and access CMS features.

### Alternative Scenario 5a — Invalid Email Format
The user opens the registration form and enters an email address that does not follow a valid email format. When the form is submitted, the system detects the formatting error during validation.

The system displays an error message explaining that the email format is invalid and prompts the user to correct it. The user remains on the registration page, and no account is created.

### Alternative Scenario 5b — Email Already Registered
The user enters an email address that is already associated with an existing CMS account and submits the registration form. The system detects that the email is already registered.

The system displays an error message indicating that the email is already in use and advises the user to log in or use a different email address. The registration process is halted, and no new account is created.

### Alternative Scenario 6a — Password Does Not Meet Security Requirements
The user provides a valid, unused email address but enters a password that does not meet the system’s security requirements. Upon submission, the system detects the password violation.

The system displays an error message describing the password requirements and prompts the user to enter a new password. The user remains on the registration page, and no account is created.

### Alternative Scenario 7a — System or Database Error
The user submits valid registration information, and the system successfully validates the email and password. While attempting to store the new account, the system encounters a database or server error.

The system displays an error message informing the user that registration failed due to a system issue and advises them to try again later. No account is created.

---

## Acceptance Test Suite

### AT-UC-01-01 — Successful Registration
**Covers**: Main Success Scenario

- **Given** the user does not already have a CMS account  
- **When** the user submits the registration form with a valid unused email and a compliant password  
- **Then** the system creates the user account  
  **And** stores it in the database  
  **And** redirects the user to the login screen

### AT-UC-01-02 — Invalid Email Format
**Covers**: Extension 5a

- **Given** the registration form is displayed  
- **When** the user submits the form with an invalid email format  
- **Then** the system displays an email format error  
  **And** no account is created

### AT-UC-01-03 — Duplicate Email
**Covers**: Extension 5b

- **Given** an account already exists with the submitted email  
- **When** the user submits the registration form  
- **Then** the system rejects the registration  
  **And** displays a duplicate email error  
  **And** no account is created

### AT-UC-01-04 — Invalid Password
**Covers**: Extension 6a

- **Given** the registration form is displayed  
- **When** the user submits a password that violates security rules  
- **Then** the system displays a password requirement error  
  **And** no account is created

### AT-UC-01-05 — System or Database Failure
**Covers**: Extension 7a

- **Given** valid registration data is submitted  
- **When** the system fails during account creation  
- **Then** the system displays a registration failure message  
  **And** no account is created

### AT-UC-01-06 — No Partial Account Creation
**Covers**: All failure paths

- **Given** a registration attempt fails validation or storage  
- **Then** no partial or unusable account exists in the system

### AT-UC-01-07 — Registration Enables Login
**Covers**: Success End Condition

- **Given** a user successfully registers  
- **When** the user proceeds to the login screen  
- **Then** the new account credentials are valid for authentication

---



*UC-01 status: COMPLETE*

# UC-02 — Validate Registration Credentials

## Source User Story
**US-02**: As the system, I want to validate email uniqueness and password strength so that user accounts are secure.

---

## Use Case (Cockburn Style)

**Goal in Context**: Ensure that a proposed email and password are acceptable for account creation to protect account integrity and security.  
**Scope**: Conference Management System (CMS)  
**Level**: Subfunction  
**Primary Actor**: CMS  
**Secondary Actors**: CMS Database, Password Policy Module  
**Trigger**: The registration form is submitted with an email and password.

### Success End Condition
* The system determines the email is unique and the password meets security standards, and returns a “valid” result to the calling process.

### Failed End Condition
* The system determines the email is not unique and/or the password does not meet security standards, or the system cannot reliably complete validation.

### Preconditions
* The system has received an email and password from a registration attempt.
* The password security standard (policy) is configured and available.
* The user store (database) is reachable under normal operation.

### Main Success Scenario
1. The system receives the submitted email and password from the registration process.
2. The system checks the email against the user database to determine whether the email is already in use.
3. The system evaluates the submitted password against the configured password security standards.
4. The system returns a “valid” result to the registration process indicating the credentials can be used to create a new account.

### Extensions
* **2a**: The email is already in use.
  * **2a1**: The system returns an “invalid” result indicating the email is not unique.
* **2b**: The system cannot query the user database.
  * **2b1**: The system returns an “error” result indicating validation could not be completed reliably.
* **3a**: The password does not meet security requirements.
  * **3a1**: The system returns an “invalid” result indicating the password is not acceptable.
* **3b**: The password policy is unavailable or misconfigured.
  * **3b1**: The system returns an “error” result indicating password validation could not be completed reliably.

### Related Information
* **Priority**: High  
* **Frequency**: High (invoked on each registration attempt)  
* **Open Issues**: Exact password security standards are not fully specified (e.g., minimum length, complexity, blacklist rules).

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A registration attempt is submitted and the CMS receives the email and password. The system checks the database to confirm the email is not already associated with an existing account. Finding no match, the system evaluates the password using the configured password security standards. The password satisfies the policy, so the system reports back to the registration workflow that the provided credentials are valid and may be used to create a new account.

### Alternative Scenario 2a — Email Already in Use
A registration attempt is submitted and the CMS receives the email and password. When the system checks the database for uniqueness, it finds that the email already exists. The system returns an invalid result indicating the email is not unique, preventing account creation.

### Alternative Scenario 2b — Database Unavailable During Uniqueness Check
A registration attempt is submitted and the CMS begins validation. When it tries to query the user database to confirm the email is unique, the database query fails due to a connectivity or server issue. Because the system cannot reliably determine uniqueness, it returns an error result indicating validation could not be completed and that account creation should not proceed.

### Alternative Scenario 3a — Password Fails Security Requirements
A registration attempt is submitted and the CMS receives the email and password. The system confirms the email is not already in use. It then evaluates the password against the configured security standards and determines that the password does not satisfy the policy. The system returns an invalid result indicating the password is unacceptable.

### Alternative Scenario 3b — Password Policy Unavailable or Misconfigured
A registration attempt is submitted and the CMS begins credential validation. The system confirms the email is unique, then attempts to evaluate the password but cannot load the configured password policy or detects invalid configuration. Since the system cannot reliably evaluate password strength, it returns an error result indicating password validation could not be completed.

---

## Acceptance Test Suite

### AT-UC-02-01 — Valid Email and Strong Password Pass Validation
**Covers**: Main Success Scenario

- **Given** the system receives an email and password from a registration attempt  
  **And** the email does not exist in the user database  
  **And** the password meets the configured security standards  
- **When** the system performs credential validation  
- **Then** the system returns a **valid** result to the registration process

### AT-UC-02-02 — Duplicate Email Fails Validation
**Covers**: Extension 2a

- **Given** the system receives an email and password from a registration attempt  
  **And** the email already exists in the user database  
- **When** the system checks email uniqueness  
- **Then** the system returns an **invalid** result indicating the email is not unique

### AT-UC-02-03 — Database Failure Produces Validation Error
**Covers**: Extension 2b

- **Given** the system receives an email and password from a registration attempt  
  **And** the user database is unavailable or the query fails  
- **When** the system attempts to check email uniqueness  
- **Then** the system returns an **error** result indicating validation could not be completed reliably

### AT-UC-02-04 — Weak Password Fails Validation
**Covers**: Extension 3a

- **Given** the system receives an email and password from a registration attempt  
  **And** the email does not exist in the user database  
  **And** the password does not meet the configured security standards  
- **When** the system evaluates the password  
- **Then** the system returns an **invalid** result indicating the password is unacceptable

### AT-UC-02-05 — Password Policy Unavailable Produces Validation Error
**Covers**: Extension 3b

- **Given** the system receives an email and password from a registration attempt  
  **And** the email does not exist in the user database  
  **And** the password policy module is unavailable or misconfigured  
- **When** the system attempts to evaluate the password  
- **Then** the system returns an **error** result indicating password validation could not be completed reliably

### AT-UC-02-06 — No “Valid” Result Unless Both Checks Succeed
**Covers**: Cross-cutting integrity requirement

- **Given** the system performs credential validation for a registration attempt  
- **When** either the email uniqueness check fails **or** the password policy check fails  
- **Then** the system does **not** return a **valid** result

---

*UC-02 status: COMPLETE*

# UC-03 — Log In User

## Source User Story
**US-03**: As a registered user, I want to log in using my credentials so that I can access my dashboard.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow a registered user to authenticate with the Conference Management System and access their personalized dashboard.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Registered User  
**Secondary Actors**: CMS Authentication Service, CMS Database  
**Trigger**: The user selects the “Log In” option on the CMS.

### Success End Condition
* The user is authenticated and redirected to their dashboard.

### Failed End Condition
* The user is not authenticated and cannot access the dashboard.

### Preconditions
* The user has a registered CMS account.
* The CMS login page is available.

### Main Success Scenario
1. The user selects the “Log In” option.
2. The system displays the login form requesting email and password.
3. The user enters their registered email and password.
4. The user submits the login form.
5. The system validates the submitted credentials against stored user data.
6. The system authenticates the user.
7. The system redirects the user to their dashboard.

### Extensions
* **5a**: The email does not exist in the system.
  * **5a1**: The system rejects authentication and displays an error message indicating invalid credentials.
* **5b**: The password is incorrect.
  * **5b1**: The system rejects authentication and displays an error message indicating invalid credentials.
* **5c**: The authentication service or database is unavailable.
  * **5c1**: The system displays an error message indicating login cannot be completed at this time.

### Related Information
* **Priority**: High  
* **Frequency**: Very High  
* **Open Issues**: Account lockout and retry limits are not specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A registered user visits the CMS homepage and selects the **Log In** option. The system presents a login form requesting the user’s email and password. The user enters valid credentials associated with an existing account and submits the form.

The system verifies the credentials against stored authentication data. Upon successful validation, the system authenticates the user and redirects them to their personalized dashboard, granting access to CMS features relevant to their role.

### Alternative Scenario 5a — Email Does Not Exist
The user enters an email address that is not associated with any CMS account and submits the login form. During validation, the system determines that the email does not exist in the database.

The system rejects the login attempt and displays an error message indicating that the credentials are invalid. The user remains on the login page.

### Alternative Scenario 5b — Incorrect Password
The user enters a valid registered email address but provides an incorrect password. The system checks the credentials and detects that the password does not match the stored value.

The system rejects the authentication attempt and displays an error message indicating invalid credentials. The user remains on the login page and may retry.

### Alternative Scenario 5c — Authentication Service Unavailable
The user submits valid login credentials, but the system encounters a failure in the authentication service or database during validation.

The system displays an error message indicating that login cannot be completed at this time and advises the user to try again later. The user is not authenticated.

---

## Acceptance Test Suite

### AT-UC-03-01 — Successful Login
**Covers**: Main Success Scenario

- **Given** the user has a registered CMS account  
- **When** the user submits valid login credentials  
- **Then** the system authenticates the user  
  **And** redirects the user to their dashboard

### AT-UC-03-02 — Login with Nonexistent Email
**Covers**: Extension 5a

- **Given** the login form is displayed  
- **When** the user submits an email not registered in the system  
- **Then** the system rejects authentication  
  **And** displays an invalid credentials error

### AT-UC-03-03 — Login with Incorrect Password
**Covers**: Extension 5b

- **Given** the login form is displayed  
- **When** the user submits an incorrect password for a registered email  
- **Then** the system rejects authentication  
  **And** displays an invalid credentials error

### AT-UC-03-04 — Authentication Service Failure
**Covers**: Extension 5c

- **Given** the login form is displayed  
- **When** the authentication service or database is unavailable  
- **Then** the system displays a login failure message  
  **And** does not authenticate the user

### AT-UC-03-05 — No Dashboard Access on Failed Login
**Covers**: Failed End Condition

- **Given** a login attempt fails for any reason  
- **Then** the user cannot access the dashboard

---

*UC-03 status: COMPLETE*

# UC-04 — Change Password

## Source User Story
**US-04**: As a registered user, I want to change my password so that I can maintain account security.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow a registered, authenticated user to change their password to maintain account security.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Registered User  
**Secondary Actors**: CMS Authentication Service, CMS Database, Password Policy Module  
**Trigger**: The user selects “Change Password” from their account settings.

### Success End Condition
* The user’s password is updated successfully and stored securely.

### Failed End Condition
* The user’s password remains unchanged.

### Preconditions
* The user is logged in (authenticated).
* The account settings page is available.

### Main Success Scenario
1. The user navigates to account settings.
2. The user selects “Change Password.”
3. The system displays a change password form requesting the current password and a new password.
4. The user enters their current password and a new password.
5. The user submits the change password form.
6. The system validates the current password against the stored credentials.
7. The system validates the new password against the configured password security standards.
8. The system updates the user’s password in the database.
9. The system confirms the password was changed successfully.

### Extensions
* **6a**: The current password is incorrect.
  * **6a1**: The system rejects the request and displays an error message indicating the current password is incorrect.
* **6b**: The authentication service or database is unavailable during current password validation.
  * **6b1**: The system displays an error message indicating the password cannot be changed at this time.
* **7a**: The new password does not meet security requirements.
  * **7a1**: The system rejects the request and displays an error message describing the password requirements.
* **7b**: The password policy module is unavailable or misconfigured.
  * **7b1**: The system displays an error message indicating the password cannot be changed at this time.
* **8a**: The system cannot update the password due to a database or server error.
  * **8a1**: The system displays an error message indicating the password change failed and advises the user to try again later.
* **5a**: The user’s session is no longer valid (expired) at submission time.
  * **5a1**: The system redirects the user to the login page and does not change the password.

### Related Information
* **Priority**: Medium  
* **Frequency**: Low to Medium  
* **Open Issues**: The SRS does not specify retry limits, account lockout behavior, or whether the user must re-authenticate after a password change.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A registered user is already logged into the CMS and opens their account settings to improve their account security. The user selects **Change Password**, and the system displays a form asking for the current password and a new password.

The user enters their current password and chooses a new password that meets the system’s security standards, then submits the form. The system validates the current password against the stored credential data, then evaluates the new password using the configured password policy. After both validations succeed, the system updates the stored password in the database.

The system confirms the change was successful, and the user leaves the settings page knowing their account is now secured with the new password.

### Alternative Scenario 6a — Current Password Incorrect
The user navigates to **Change Password**, enters a new password, but mistakenly types the current password incorrectly. After submission, the system validates the current password against stored credentials and detects the mismatch.

The system rejects the request, displays an error indicating the current password is incorrect, and keeps the user on the change password form. The system does not modify the stored password.

### Alternative Scenario 6b — Authentication/Database Unavailable During Validation
The user submits the change password form with correct information, but when the system attempts to validate the current password, it cannot reach the authentication service or database.

Because the system cannot reliably confirm the user’s current password, it displays an error indicating the password cannot be changed at this time and advises the user to try again later. No password change is performed.

### Alternative Scenario 7a — New Password Fails Security Requirements
The user enters the correct current password but selects a new password that violates the configured password security rules. After submission, the system validates the current password successfully and then evaluates the new password.

The system rejects the request, displays an error describing the password requirements, and keeps the user on the change password form. The stored password remains unchanged.

### Alternative Scenario 7b — Password Policy Unavailable or Misconfigured
The user submits a change password request with a correct current password and a candidate new password. The system validates the current password successfully but cannot load or apply the configured password policy.

Since the system cannot reliably determine whether the new password is acceptable, it displays an error indicating the password cannot be changed at this time. No update is made.

### Alternative Scenario 8a — Failure While Updating Stored Password
The user submits a valid request and the system validates both the current password and the new password successfully. When the system attempts to update the password in the database, an internal error occurs.

The system reports that the password change failed and advises the user to try again later. The user’s password is not updated.

### Alternative Scenario 5a — Session Expired at Submission
The user opens the change password form but takes too long to submit it. When the user submits the form, the system determines the session is no longer valid.

The system redirects the user to the login page and does not process the password change.

---

## Acceptance Test Suite

Format: **Given / When / Then**  
Coverage: **Main Success Scenario + extensions (6a, 6b, 7a, 7b, 8a, 5a)**

### AT-UC-04-01 — Successful Password Change
**Covers**: Main Success Scenario

- **Given** the user is logged in and on the change password form  
- **When** the user submits the correct current password and a new password that meets security requirements  
- **Then** the system updates the stored password  
  **And** confirms success to the user

### AT-UC-04-02 — Reject Incorrect Current Password
**Covers**: Extension 6a

- **Given** the user is logged in and on the change password form  
- **When** the user submits an incorrect current password  
- **Then** the system rejects the request  
  **And** displays an error indicating the current password is incorrect  
  **And** the stored password remains unchanged

### AT-UC-04-03 — Validation Failure Due to Auth/Database Unavailability
**Covers**: Extension 6b

- **Given** the user is logged in and submits a change password request  
  **And** the authentication service or database is unavailable during current password validation  
- **When** the system attempts to validate the current password  
- **Then** the system displays an error indicating the password cannot be changed at this time  
  **And** the stored password remains unchanged

### AT-UC-04-04 — Reject New Password That Fails Security Rules
**Covers**: Extension 7a

- **Given** the user is logged in and provides the correct current password  
- **When** the user submits a new password that violates security requirements  
- **Then** the system rejects the request  
  **And** displays password requirement guidance  
  **And** the stored password remains unchanged

### AT-UC-04-05 — Password Policy Unavailable Produces Error
**Covers**: Extension 7b

- **Given** the user is logged in and submits a change password request  
  **And** the password policy module is unavailable or misconfigured  
- **When** the system attempts to validate the new password  
- **Then** the system displays an error indicating the password cannot be changed at this time  
  **And** the stored password remains unchanged

### AT-UC-04-06 — Update Failure Does Not Change Stored Password
**Covers**: Extension 8a

- **Given** the user submits a valid change password request  
  **And** an internal error occurs while updating the stored password  
- **When** the system attempts to persist the new password  
- **Then** the system reports that the password change failed  
  **And** the stored password remains unchanged

### AT-UC-04-07 — Session Expired Prevents Password Change
**Covers**: Extension 5a

- **Given** the user’s session is expired at submission time  
- **When** the user submits the change password form  
- **Then** the system redirects the user to the login page  
  **And** the stored password remains unchanged

### AT-UC-04-08 — No Login With New Password Unless Change Succeeds
**Covers**: Integrity requirement (Success/Failed End Conditions)

- **Given** a password change attempt fails for any reason  
- **When** the user attempts to log in using the proposed new password  
- **Then** authentication fails  
  **And** the user can still authenticate using the previously stored password (if login is otherwise permitted)

---

*UC-04 status: COMPLETE*

# UC-05 — Submit Paper

## Source User Story
**US-05**: As an author, I want to submit a paper with metadata and a manuscript file so that it can be reviewed.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow an author to submit a paper, including required metadata and a manuscript file, to the Conference Management System for review.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Author  
**Secondary Actors**: CMS Database, File Storage System  
**Trigger**: The author selects the “Submit Paper” option in the CMS.

### Success End Condition
* The paper submission, including metadata and manuscript file, is successfully stored and marked as submitted for review.

### Failed End Condition
* The paper submission is not stored, and the paper is not available for review.

### Preconditions
* The author is registered and logged into the CMS.
* The submission period is open.
* The author has permission to submit papers.

### Main Success Scenario
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

### Extensions
* **3a**: Required metadata fields are missing or incomplete.  
  * **3a1**: The system displays an error message identifying missing metadata and prompts the author to complete the required fields.
* **4a**: The manuscript file is missing.  
  * **4a1**: The system displays an error message indicating that a manuscript file is required and prompts the author to upload a file.
* **7a**: The manuscript file does not meet format or size requirements.  
  * **7a1**: The system displays an error message describing acceptable file formats and size limits and prompts the author to upload a compliant file.
* **8a**: The system cannot store submission data due to a database error.  
  * **8a1**: The system displays an error message indicating submission failure and advises the author to try again later.
* **9a**: The system cannot store the manuscript file due to a file storage error.  
  * **9a1**: The system displays an error message indicating submission failure and advises the author to try again later.

### Related Information
* **Priority**: High  
* **Frequency**: Medium  
* **Open Issues**: Exact manuscript file format and size limits are referenced but not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
An author logs into the Conference Management System during the active submission period and chooses to submit a new paper. The author selects the **Submit Paper** option, and the system presents a submission form requesting paper metadata and a manuscript file.

The author enters all required metadata, including the paper title, abstract, author information, and keywords, and uploads a manuscript file that meets the system’s requirements. After submitting the form, the system validates the completeness of the metadata and verifies that the manuscript file is acceptable.

Once validation succeeds, the system stores the submission metadata in the CMS database and saves the manuscript file in the file storage system. The system confirms that the submission was successful and marks the paper as submitted for review.

### Alternative Scenario 3a — Missing or Incomplete Metadata
The author opens the paper submission form but omits one or more required metadata fields. When the form is submitted, the system detects that required information is missing.

The system displays an error message identifying the missing metadata fields and prompts the author to complete them. The submission is not stored.

### Alternative Scenario 4a — Missing Manuscript File
The author completes the metadata fields but does not upload a manuscript file before submitting the form. The system detects that no file was provided.

The system displays an error message indicating that a manuscript file is required and prompts the author to upload one. The submission process is halted.

### Alternative Scenario 7a — Invalid Manuscript File
The author uploads a manuscript file that does not meet the required format or size constraints. Upon submission, the system detects the file validation error.

The system displays an error message explaining the acceptable file formats and size limits and prompts the author to upload a compliant file. No submission is stored.

### Alternative Scenario 8a — Database Error
The author submits valid metadata and a compliant manuscript file. While attempting to store the submission metadata, the system encounters a database error.

The system displays an error message informing the author that the submission failed due to a system issue and advises them to try again later. No submission is stored.

### Alternative Scenario 9a — File Storage Error
The author submits valid metadata and a compliant manuscript file. The system successfully validates the submission but encounters an error while storing the manuscript file.

The system displays an error message indicating that the submission failed due to a system issue and advises the author to try again later. No submission is stored.

---

## Acceptance Test Suite

### AT-UC-05-01 — Successful Paper Submission
**Covers**: Main Success Scenario

- **Given** the author is logged in and the submission period is open  
- **When** the author submits complete metadata and a compliant manuscript file  
- **Then** the system stores the submission metadata  
  **And** stores the manuscript file  
  **And** marks the paper as submitted for review

### AT-UC-05-02 — Missing Metadata
**Covers**: Extension 3a

- **Given** the submission form is displayed  
- **When** the author submits the form with missing required metadata  
- **Then** the system displays a metadata error  
  **And** no submission is stored

### AT-UC-05-03 — Missing Manuscript File
**Covers**: Extension 4a

- **Given** the submission form is displayed  
- **When** the author submits metadata without a manuscript file  
- **Then** the system displays a file-required error  
  **And** no submission is stored

### AT-UC-05-04 — Invalid Manuscript File
**Covers**: Extension 7a

- **Given** the submission form is displayed  
- **When** the author uploads a manuscript file that violates format or size rules  
- **Then** the system displays a file validation error  
  **And** no submission is stored

### AT-UC-05-05 — Database Failure
**Covers**: Extension 8a

- **Given** valid submission data is provided  
- **When** the system fails while storing submission metadata  
- **Then** the system displays a submission failure message  
  **And** no submission is stored

### AT-UC-05-06 — File Storage Failure
**Covers**: Extension 9a

- **Given** valid submission data is provided  
- **When** the system fails while storing the manuscript file  
- **Then** the system displays a submission failure message  
  **And** no submission is stored

### AT-UC-05-07 — No Partial Submission
**Covers**: All failure paths

- **Given** a paper submission attempt fails  
- **Then** no partial submission or orphaned file exists in the system

---

*UC-05 status: COMPLETE*

# UC-06 — Save Submission Draft

## Source User Story
**US-06**: As an author, I want to save my paper submission progress so that I can complete it later.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow an author to save a draft of a paper submission, including partially completed metadata and optional manuscript file, so the submission can be completed later.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Author  
**Secondary Actors**: CMS Database, File Storage System  
**Trigger**: The author selects the “Save Draft” option while working on a paper submission.

### Success End Condition
* The submission draft is saved and can be retrieved and edited by the author at a later time.

### Failed End Condition
* The submission draft is not saved, and any unsaved progress is lost.

### Preconditions
* The author is registered and logged into the CMS.
* The submission period is open.
* The author has permission to submit papers.

### Main Success Scenario
1. The author is working on a paper submission form.
2. The author selects the “Save Draft” option.
3. The system collects the currently entered metadata.
4. The system collects the currently uploaded manuscript file, if any.
5. The system validates that the draft contains sufficient information to be saved.
6. The system stores the draft metadata in the CMS database.
7. The system stores the manuscript file, if present, in the file storage system.
8. The system confirms that the draft has been saved successfully.

### Extensions
* **5a**: The draft does not contain the minimum required information to be saved.  
  * **5a1**: The system displays an error message indicating that required draft information is missing and prompts the author to add it.
* **6a**: The system cannot store draft metadata due to a database error.  
  * **6a1**: The system displays an error message indicating that the draft could not be saved and advises the author to try again later.
* **7a**: The system cannot store the manuscript file due to a file storage error.  
  * **7a1**: The system displays an error message indicating that the draft could not be saved and advises the author to try again later.

### Related Information
* **Priority**: Medium  
* **Frequency**: High  
* **Open Issues**: The minimum required information for saving a draft is referenced but not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
An author logs into the Conference Management System during the submission period and begins entering information for a new paper submission. After partially completing the submission form, the author decides to pause and save their progress.

The author selects the **Save Draft** option. The system gathers the currently entered metadata and any uploaded manuscript file. The system validates that the draft contains enough information to be stored.

After validation, the system stores the draft metadata in the CMS database and saves the manuscript file, if present, in the file storage system. The system confirms that the draft has been saved successfully, allowing the author to return later and complete the submission.

### Alternative Scenario 5a — Insufficient Draft Information
The author selects the **Save Draft** option while the submission form lacks the minimum required information. The system detects that essential draft data is missing.

The system displays an error message explaining that additional information is required before the draft can be saved and prompts the author to provide the missing data. The draft is not saved.

### Alternative Scenario 6a — Database Error
The author attempts to save a draft with sufficient information. While storing the draft metadata, the system encounters a database error.

The system displays an error message informing the author that the draft could not be saved due to a system issue and advises them to try again later. No draft is saved.

### Alternative Scenario 7a — File Storage Error
The author attempts to save a draft that includes a manuscript file. The system successfully validates the draft but encounters an error while storing the file.

The system displays an error message indicating that the draft could not be saved due to a system issue and advises the author to try again later. No draft is saved.

---

## Acceptance Test Suite

### AT-UC-06-01 — Successful Draft Save
**Covers**: Main Success Scenario

- **Given** the author is logged in and working on a submission  
- **When** the author selects the save draft option with sufficient draft information  
- **Then** the system stores the draft metadata  
  **And** stores the manuscript file if present  
  **And** confirms the draft was saved

### AT-UC-06-02 — Insufficient Draft Information
**Covers**: Extension 5a

- **Given** the submission form is displayed  
- **When** the author attempts to save a draft without required information  
- **Then** the system displays a draft information error  
  **And** no draft is saved

### AT-UC-06-03 — Database Failure
**Covers**: Extension 6a

- **Given** sufficient draft information is provided  
- **When** the system fails while storing draft metadata  
- **Then** the system displays a draft save failure message  
  **And** no draft is saved

### AT-UC-06-04 — File Storage Failure
**Covers**: Extension 7a

- **Given** sufficient draft information including a manuscript file is provided  
- **When** the system fails while storing the manuscript file  
- **Then** the system displays a draft save failure message  
  **And** no draft is saved

### AT-UC-06-05 — Draft Retrieval Integrity
**Covers**: Success End Condition

- **Given** a draft has been successfully saved  
- **When** the author returns to edit the draft later  
- **Then** the previously saved metadata and file state are available

---

*UC-06 status: COMPLETE*

# UC-07 — Validate Submission Data

## Source User Story
**US-07**: As the system, I want to validate file format, size, and form fields so that only valid submissions are accepted.

---

## Use Case (Cockburn Style)

**Goal in Context**: Ensure that all submission data, including form fields and uploaded files, meets defined validation rules before being accepted by the Conference Management System.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: System  
**Secondary Actors**: CMS Database, File Storage System  
**Trigger**: A submission or draft save action is initiated by a user.

### Success End Condition
* All submitted form fields and files are validated successfully, allowing the submission or draft save process to proceed.

### Failed End Condition
* Validation fails, and the submission or draft save process is halted with no data accepted.

### Preconditions
* A user has initiated a submission or draft save action.
* Submission data and/or files have been provided to the system.

### Main Success Scenario
1. A submission or draft save action is initiated.
2. The system receives the submitted form fields and uploaded file data.
3. The system validates that all required form fields are present.
4. The system validates that all form field values meet defined constraints.
5. The system validates that uploaded files meet allowed format requirements.
6. The system validates that uploaded files meet size limitations.
7. The system confirms that all validation checks pass.
8. The system allows the submission or draft save process to continue.

### Extensions
* **3a**: One or more required form fields are missing.  
  * **3a1**: The system reports a validation error identifying missing required fields and halts processing.
* **4a**: One or more form field values violate constraints.  
  * **4a1**: The system reports a validation error describing the invalid field values and halts processing.
* **5a**: An uploaded file has an invalid format.  
  * **5a1**: The system reports a validation error describing acceptable file formats and halts processing.
* **6a**: An uploaded file exceeds the allowed size limit.  
  * **6a1**: The system reports a validation error describing file size limits and halts processing.
* **7a**: The system encounters an internal error during validation.  
  * **7a1**: The system reports a validation failure and halts processing.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Exact validation rules for file formats, size limits, and field constraints are referenced but not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A user initiates a submission or draft save action in the Conference Management System. The system receives the provided form fields and any uploaded files associated with the request.

The system verifies that all required form fields are present and that each field value satisfies defined constraints. The system then checks that any uploaded files conform to approved formats and do not exceed size limits.

After all validation checks pass successfully, the system confirms validation completion and allows the submission or draft save process to proceed.

### Alternative Scenario 3a — Missing Required Fields
The system receives submission data that is missing one or more required form fields. During validation, the system detects the omission.

The system reports a validation error identifying the missing required fields and halts further processing. No data is accepted.

### Alternative Scenario 4a — Invalid Field Values
The system receives submission data containing one or more form field values that violate defined constraints. The system detects the invalid values during validation.

The system reports a validation error describing the invalid field values and halts processing. No data is accepted.

### Alternative Scenario 5a — Invalid File Format
The system receives an uploaded file that does not match an approved file format. The system detects the format violation during validation.

The system reports a validation error describing acceptable file formats and halts processing. No data is accepted.

### Alternative Scenario 6a — File Size Exceeded
The system receives an uploaded file that exceeds the allowed size limit. During validation, the system detects the size violation.

The system reports a validation error describing the file size limits and halts processing. No data is accepted.

### Alternative Scenario 7a — System Validation Error
While performing validation checks, the system encounters an internal error that prevents completion of validation.

The system reports a validation failure and halts processing. No data is accepted.

---

## Acceptance Test Suite

### AT-UC-07-01 — Successful Validation
**Covers**: Main Success Scenario

- **Given** submission data and files are provided  
- **When** the system validates all form fields and files  
- **Then** all validation checks pass  
  **And** the submission or draft save process proceeds

### AT-UC-07-02 — Missing Required Fields
**Covers**: Extension 3a

- **Given** submission data is missing required fields  
- **When** the system performs validation  
- **Then** the system reports missing field errors  
  **And** processing is halted

### AT-UC-07-03 — Invalid Field Values
**Covers**: Extension 4a

- **Given** submission data contains invalid field values  
- **When** the system performs validation  
- **Then** the system reports field constraint errors  
  **And** processing is halted

### AT-UC-07-04 — Invalid File Format
**Covers**: Extension 5a

- **Given** an uploaded file has an invalid format  
- **When** the system performs validation  
- **Then** the system reports a file format error  
  **And** processing is halted

### AT-UC-07-05 — File Size Limit Exceeded
**Covers**: Extension 6a

- **Given** an uploaded file exceeds the size limit  
- **When** the system performs validation  
- **Then** the system reports a file size error  
  **And** processing is halted

### AT-UC-07-06 — Validation System Failure
**Covers**: Extension 7a

- **Given** valid submission data is provided  
- **When** the system encounters an internal validation error  
- **Then** the system reports a validation failure  
  **And** processing is halted

### AT-UC-07-07 — No Partial Acceptance
**Covers**: All failure paths

- **Given** validation fails for any reason  
- **Then** no partial submission data or files are accepted

---

*UC-07 status: COMPLETE*

# UC-08 — Assign Reviewers

## Source User Story
**US-08**: As an editor, I want to assign reviewers to submitted papers so that each paper can be evaluated.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow an editor to assign one or more qualified reviewers to submitted papers so the review process can proceed.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Editor  
**Secondary Actors**: CMS Database, Reviewer Notification System  
**Trigger**: The editor selects the “Assign Reviewers” option for a submitted paper.

### Success End Condition
* One or more reviewers are successfully assigned to the selected paper, and the assignments are stored and communicated.

### Failed End Condition
* No reviewers are assigned, and the paper remains unassigned for review.

### Preconditions
* The editor is registered and logged into the CMS.
* The paper has been successfully submitted.
* Eligible reviewers exist in the system.

### Main Success Scenario
1. The editor selects a submitted paper.
2. The editor selects the “Assign Reviewers” option.
3. The system displays a list of eligible reviewers.
4. The editor selects one or more reviewers for the paper.
5. The editor confirms the reviewer assignments.
6. The system validates that the selected reviewers are eligible and available.
7. The system stores the reviewer assignments in the CMS database.
8. The system notifies the assigned reviewers of their review assignments.

### Extensions
* **3a**: No eligible reviewers are available.  
  * **3a1**: The system displays a message indicating that no eligible reviewers are available and prevents assignment.
* **4a**: The editor selects an invalid or duplicate reviewer.  
  * **4a1**: The system displays an error message indicating the reviewer selection is invalid and prompts the editor to revise the selection.
* **6a**: A selected reviewer is not eligible or exceeds workload limits.  
  * **6a1**: The system displays an error message indicating the reviewer cannot be assigned and prompts the editor to choose a different reviewer.
* **7a**: The system cannot store reviewer assignments due to a database error.  
  * **7a1**: The system displays an error message indicating assignment failure and advises the editor to try again later.
* **8a**: The system cannot notify reviewers due to a notification system error.  
  * **8a1**: The system displays a warning indicating notifications failed while keeping the assignments recorded.

### Related Information
* **Priority**: High  
* **Frequency**: Medium  
* **Open Issues**: Reviewer eligibility rules and workload limits are referenced but not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
An editor logs into the Conference Management System and reviews the list of submitted papers awaiting reviewer assignment. The editor selects a paper and chooses the **Assign Reviewers** option.

The system displays a list of eligible reviewers. The editor selects one or more reviewers and confirms the assignment. The system validates reviewer eligibility and availability.

After successful validation, the system stores the reviewer assignments in the CMS database and notifies the assigned reviewers so they can begin the evaluation process.

### Alternative Scenario 3a — No Eligible Reviewers Available
The editor selects the **Assign Reviewers** option for a submitted paper. The system determines that no eligible reviewers are available.

The system displays a message indicating that no eligible reviewers are available and prevents the editor from completing the assignment. The paper remains unassigned.

### Alternative Scenario 4a — Invalid Reviewer Selection
The editor selects one or more reviewers that are invalid or duplicated. The system detects the issue during validation.

The system displays an error message indicating that the reviewer selection is invalid and prompts the editor to revise the selection. No assignments are stored.

### Alternative Scenario 6a — Reviewer Not Eligible or Overloaded
The editor selects a reviewer who exceeds workload limits or does not meet eligibility criteria. The system detects the conflict during validation.

The system displays an error message indicating that the reviewer cannot be assigned and prompts the editor to select a different reviewer. No assignments are stored.

### Alternative Scenario 7a — Database Error
The editor confirms valid reviewer assignments. While storing the assignments, the system encounters a database error.

The system displays an error message indicating that reviewer assignment failed due to a system issue and advises the editor to try again later. No assignments are stored.

### Alternative Scenario 8a — Notification Failure
The editor successfully assigns reviewers, and the system stores the assignments. While notifying reviewers, the system encounters a notification system error.

The system displays a warning indicating that reviewer notifications failed while retaining the recorded assignments.

---

## Acceptance Test Suite

### AT-UC-08-01 — Successful Reviewer Assignment
**Covers**: Main Success Scenario

- **Given** a submitted paper and eligible reviewers exist  
- **When** the editor assigns reviewers and confirms  
- **Then** the system stores the reviewer assignments  
  **And** notifies the assigned reviewers

### AT-UC-08-02 — No Eligible Reviewers
**Covers**: Extension 3a

- **Given** no eligible reviewers are available  
- **When** the editor attempts to assign reviewers  
- **Then** the system displays a no-available-reviewers message  
  **And** no assignments are stored

### AT-UC-08-03 — Invalid Reviewer Selection
**Covers**: Extension 4a

- **Given** the reviewer selection contains invalid or duplicate reviewers  
- **When** the editor confirms the assignment  
- **Then** the system displays a selection error  
  **And** no assignments are stored

### AT-UC-08-04 — Reviewer Eligibility Violation
**Covers**: Extension 6a

- **Given** a reviewer exceeds workload limits or is ineligible  
- **When** the editor attempts assignment  
- **Then** the system displays an eligibility error  
  **And** no assignments are stored

### AT-UC-08-05 — Database Failure
**Covers**: Extension 7a

- **Given** valid reviewer assignments are confirmed  
- **When** the system fails while storing assignments  
- **Then** the system displays an assignment failure message  
  **And** no assignments are stored

### AT-UC-08-06 — Notification Failure
**Covers**: Extension 8a

- **Given** reviewer assignments are successfully stored  
- **When** the notification system fails  
- **Then** the system displays a notification warning  
  **And** reviewer assignments remain recorded

### AT-UC-08-07 — Assignment Integrity
**Covers**: Success End Condition

- **Given** reviewers are successfully assigned  
- **Then** the paper is marked as assigned for review in the system

---

*UC-08 status: COMPLETE*

# UC-09 — Enforce Reviewer Workload Limit

## Source User Story
**US-09**: As the system, I want to prevent assigning more than five papers to a reviewer so that workload is fair.

---

## Use Case (Cockburn Style)

**Goal in Context**: Ensure that no reviewer is assigned more than five papers, maintaining fair workload distribution during reviewer assignment.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: System  
**Secondary Actors**: CMS Database  
**Trigger**: A reviewer assignment action is initiated for a paper.

### Success End Condition
* Reviewer workload limits are enforced, and only eligible reviewers with fewer than five assigned papers can be assigned.

### Failed End Condition
* The reviewer assignment is prevented due to workload limit violation, and no new assignment is made.

### Preconditions
* A reviewer assignment action has been initiated.
* Reviewer workload data exists in the CMS.

### Main Success Scenario
1. A reviewer assignment action is initiated.
2. The system retrieves the current number of papers assigned to the selected reviewer.
3. The system verifies that the reviewer has fewer than five assigned papers.
4. The system allows the reviewer to be assigned to the paper.
5. The system updates the reviewer’s assignment count in the CMS database.

### Extensions
* **3a**: The reviewer already has five assigned papers.  
  * **3a1**: The system prevents the assignment and reports a workload limit violation.
* **2a**: The system cannot retrieve reviewer workload data due to a database error.  
  * **2a1**: The system prevents the assignment and reports an assignment failure.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Whether workload limits vary by conference or role is not specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
During the reviewer assignment process, the system evaluates the eligibility of a selected reviewer. The system retrieves the number of papers currently assigned to the reviewer.

After determining that the reviewer has fewer than five assigned papers, the system allows the assignment to proceed. The reviewer is successfully assigned to the paper, and the system updates the reviewer’s assignment count to reflect the new workload.

### Alternative Scenario 3a — Reviewer Workload Limit Reached
The system retrieves the reviewer’s current assignment count and determines that the reviewer already has five assigned papers.

The system prevents the reviewer from being assigned to the paper and reports a workload limit violation. The assignment does not proceed.

### Alternative Scenario 2a — Workload Data Retrieval Failure
While attempting to retrieve the reviewer’s current assignment count, the system encounters a database error.

The system prevents the reviewer assignment and reports an assignment failure due to a system issue. No assignment is made.

---

## Acceptance Test Suite

### AT-UC-09-01 — Assignment Within Workload Limit
**Covers**: Main Success Scenario

- **Given** a reviewer has fewer than five assigned papers  
- **When** the system evaluates the reviewer for assignment  
- **Then** the system allows the reviewer to be assigned  
  **And** updates the reviewer’s assignment count

### AT-UC-09-02 — Workload Limit Violation
**Covers**: Extension 3a

- **Given** a reviewer already has five assigned papers  
- **When** the system evaluates the reviewer for assignment  
- **Then** the system prevents the assignment  
  **And** reports a workload limit violation

### AT-UC-09-03 — Workload Data Retrieval Failure
**Covers**: Extension 2a

- **Given** reviewer workload data cannot be retrieved  
- **When** the system evaluates the reviewer for assignment  
- **Then** the system prevents the assignment  
  **And** reports an assignment failure

### AT-UC-09-04 — No Over-Assignment
**Covers**: Success End Condition

- **Given** reviewer workload limits are enforced  
- **Then** no reviewer has more than five assigned papers in the system

---

*UC-09 status: COMPLETE*

# UC-10 — Notify Reviewers

## Source User Story
**US-10**: As the system, I want to notify reviewers by email so that they can accept or reject review assignments.

---

## Use Case (Cockburn Style)

**Goal in Context**: Notify assigned reviewers of new review assignments so they can respond by accepting or rejecting the assignment.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: System  
**Secondary Actors**: Email System, CMS Database  
**Trigger**: Reviewer assignments are successfully created for a paper.

### Success End Condition
* Reviewers are notified by email of their review assignments and can proceed to accept or reject them.

### Failed End Condition
* Reviewers are not notified, and review assignments remain unacknowledged.

### Preconditions
* Reviewer assignments have been successfully stored in the CMS.
* Reviewers have valid email addresses registered in the system.

### Main Success Scenario
1. Reviewer assignments are created for a paper.
2. The system retrieves the email addresses of the assigned reviewers.
3. The system generates notification emails containing assignment details.
4. The system sends the notification emails to the assigned reviewers.
5. The system records that notification emails were successfully sent.

### Extensions
* **2a**: A reviewer does not have a valid email address on record.  
  * **2a1**: The system skips notification for that reviewer and records a notification failure.
* **4a**: The email system fails to send one or more notification emails.  
  * **4a1**: The system records the notification failure and reports the issue for administrative review.
* **5a**: The system cannot record notification status due to a database error.  
  * **5a1**: The system reports a notification logging failure and advises administrative follow-up.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Retry policies and escalation procedures for failed notifications are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
After reviewers are assigned to a paper, the Conference Management System initiates the notification process. The system retrieves the email addresses associated with each assigned reviewer and prepares notification messages containing details of the review assignment.

The system sends the emails to the reviewers and records that the notifications were successfully delivered. Reviewers can then access the CMS to accept or reject their assignments.

### Alternative Scenario 2a — Missing or Invalid Email Address
The system attempts to retrieve a reviewer’s email address but determines that the address is missing or invalid.

The system skips sending the notification to that reviewer and records a notification failure. The reviewer is not notified.

### Alternative Scenario 4a — Email Delivery Failure
The system generates notification emails for assigned reviewers but encounters a failure in the email system while sending one or more messages.

The system records the notification failure and reports the issue for administrative review. Reviewers may not receive notification emails.

### Alternative Scenario 5a — Notification Logging Failure
The system successfully sends notification emails but encounters a database error while attempting to record the notification status.

The system reports a notification logging failure and advises administrative follow-up. Reviewer notifications may have been sent, but logging is incomplete.

---

## Acceptance Test Suite

### AT-UC-10-01 — Successful Reviewer Notification
**Covers**: Main Success Scenario

- **Given** reviewers are assigned to a paper  
- **When** the system sends notification emails  
- **Then** notification emails are sent to assigned reviewers  
  **And** notification status is recorded

### AT-UC-10-02 — Missing Email Address
**Covers**: Extension 2a

- **Given** a reviewer has no valid email address  
- **When** the system attempts to send notifications  
- **Then** the system skips that reviewer  
  **And** records a notification failure

### AT-UC-10-03 — Email System Failure
**Covers**: Extension 4a

- **Given** valid reviewer email addresses exist  
- **When** the email system fails during notification  
- **Then** the system records the notification failure  
  **And** reports the issue for administrative review

### AT-UC-10-04 — Notification Logging Failure
**Covers**: Extension 5a

- **Given** notification emails are sent  
- **When** the system fails to record notification status  
- **Then** the system reports a logging failure  
  **And** advises administrative follow-up

### AT-UC-10-05 — Notification Enables Response
**Covers**: Success End Condition

- **Given** reviewers are successfully notified  
- **When** reviewers access the CMS  
- **Then** they can accept or reject their review assignments

---

*UC-10 status: COMPLETE*

# UC-11 — Respond to Review Invitation

## Source User Story
**US-11**: As a reviewer, I want to accept or reject a review invitation so that I control my assigned workload.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow a reviewer to accept or reject a review invitation so they can manage their review workload.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Reviewer  
**Secondary Actors**: CMS Database, Notification System  
**Trigger**: The reviewer selects a review invitation from the CMS.

### Success End Condition
* The reviewer’s response is recorded, and the review assignment is updated accordingly.

### Failed End Condition
* The reviewer’s response is not recorded, and the review assignment remains unchanged.

### Preconditions
* The reviewer is registered and logged into the CMS.
* The reviewer has received at least one review invitation.
* The review invitation is still pending.

### Main Success Scenario
1. The reviewer accesses the list of pending review invitations.
2. The reviewer selects a review invitation.
3. The system displays the review assignment details and response options.
4. The reviewer selects either “Accept” or “Reject.”
5. The reviewer confirms their response.
6. The system records the reviewer’s response in the CMS database.
7. The system updates the review assignment status.
8. The system notifies the editor of the reviewer’s decision.

### Extensions
* **4a**: The reviewer attempts to respond after the invitation has expired or been withdrawn.  
  * **4a1**: The system displays an error message indicating the invitation is no longer valid and prevents response.
* **6a**: The system cannot record the response due to a database error.  
  * **6a1**: The system displays an error message indicating the response could not be saved and advises the reviewer to try again later.
* **8a**: The system cannot notify the editor due to a notification system error.  
  * **8a1**: The system displays a warning indicating notification failure while keeping the response recorded.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Invitation expiration timing and reminder policies are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A reviewer logs into the Conference Management System and views their list of pending review invitations. The reviewer selects an invitation to review its details.

After reviewing the assignment information, the reviewer chooses to either accept or reject the invitation and confirms the decision. The system records the response, updates the assignment status, and notifies the editor of the reviewer’s decision.

### Alternative Scenario 4a — Invitation No Longer Valid
The reviewer selects a review invitation that has expired or been withdrawn. When attempting to respond, the system detects that the invitation is no longer valid.

The system displays an error message indicating that the invitation cannot be responded to and prevents the action. No response is recorded.

### Alternative Scenario 6a — Database Error
The reviewer submits a valid response to a review invitation. While recording the response, the system encounters a database error.

The system displays an error message indicating that the response could not be saved and advises the reviewer to try again later. The assignment status remains unchanged.

### Alternative Scenario 8a — Notification Failure
The reviewer’s response is successfully recorded, but the system encounters a failure while notifying the editor.

The system displays a warning indicating that notification failed while keeping the response recorded in the system.

---

## Acceptance Test Suite

### AT-UC-11-01 — Accept Review Invitation
**Covers**: Main Success Scenario

- **Given** a pending review invitation exists  
- **When** the reviewer accepts the invitation  
- **Then** the system records the acceptance  
  **And** updates the assignment status  
  **And** notifies the editor

### AT-UC-11-02 — Reject Review Invitation
**Covers**: Main Success Scenario

- **Given** a pending review invitation exists  
- **When** the reviewer rejects the invitation  
- **Then** the system records the rejection  
  **And** updates the assignment status  
  **And** notifies the editor

### AT-UC-11-03 — Invitation Expired or Withdrawn
**Covers**: Extension 4a

- **Given** a review invitation is no longer valid  
- **When** the reviewer attempts to respond  
- **Then** the system displays an invalid invitation error  
  **And** no response is recorded

### AT-UC-11-04 — Database Failure
**Covers**: Extension 6a

- **Given** a valid response is submitted  
- **When** the system fails while recording the response  
- **Then** the system displays a response failure message  
  **And** the assignment status remains unchanged

### AT-UC-11-05 — Notification Failure
**Covers**: Extension 8a

- **Given** a reviewer response is recorded  
- **When** the notification system fails  
- **Then** the system displays a notification warning  
  **And** the response remains recorded

---

*UC-11 status: COMPLETE*

# UC-12 — Submit Paper Review

## Source User Story
**US-12**: As a reviewer, I want to access assigned papers and submit a completed review form so that the editor can evaluate the paper.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow a reviewer to access assigned papers and submit a completed review form so the editor can evaluate the paper.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Reviewer  
**Secondary Actors**: CMS Database, File Storage System  
**Trigger**: The reviewer selects an assigned paper to review.

### Success End Condition
* The completed review is successfully submitted and stored, and the editor can access it for evaluation.

### Failed End Condition
* The review is not submitted, and the editor cannot access a completed review for the paper.

### Preconditions
* The reviewer is registered and logged into the CMS.
* The reviewer has accepted a review assignment.
* The review submission period is open.

### Main Success Scenario
1. The reviewer accesses the list of assigned papers.
2. The reviewer selects a paper to review.
3. The system displays the paper details and review form.
4. The reviewer completes the review form.
5. The reviewer submits the completed review.
6. The system validates that all required review fields are completed.
7. The system stores the completed review in the CMS database.
8. The system confirms successful review submission.

### Extensions
* **4a**: The reviewer attempts to submit an incomplete review form.  
  * **4a1**: The system displays an error message indicating required review fields are missing and prompts the reviewer to complete them.
* **5a**: The review submission period has closed.  
  * **5a1**: The system displays an error message indicating that reviews can no longer be submitted.
* **7a**: The system cannot store the review due to a database error.  
  * **7a1**: The system displays an error message indicating review submission failed and advises the reviewer to try again later.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Review form structure and required fields are referenced but not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A reviewer logs into the Conference Management System and views their list of assigned papers. The reviewer selects one paper to begin the evaluation process.

The system displays the paper details along with a review form. The reviewer completes all required sections of the review form and submits it. The system validates the review content and stores the completed review in the CMS database. The system confirms that the review has been successfully submitted, making it available to the editor for evaluation.

### Alternative Scenario 4a — Incomplete Review Form
The reviewer begins completing the review form but leaves one or more required fields empty. When the reviewer submits the form, the system detects missing required information.

The system displays an error message identifying the missing fields and prompts the reviewer to complete them. The review is not submitted.

### Alternative Scenario 5a — Review Period Closed
The reviewer attempts to submit a completed review after the review submission period has closed.

The system displays an error message indicating that review submissions are no longer accepted. The review is not submitted.

### Alternative Scenario 7a — Database Error
The reviewer submits a completed review form during the review period. While storing the review, the system encounters a database error.

The system displays an error message informing the reviewer that the review submission failed due to a system issue and advises them to try again later. The review is not stored.

---

## Acceptance Test Suite

### AT-UC-12-01 — Successful Review Submission
**Covers**: Main Success Scenario

- **Given** the reviewer has an assigned paper and the review period is open  
- **When** the reviewer submits a completed review form  
- **Then** the system stores the review  
  **And** confirms successful submission

### AT-UC-12-02 — Incomplete Review Form
**Covers**: Extension 4a

- **Given** the review form is displayed  
- **When** the reviewer submits the form with missing required fields  
- **Then** the system displays a review completeness error  
  **And** the review is not submitted

### AT-UC-12-03 — Review Period Closed
**Covers**: Extension 5a

- **Given** the review submission period has ended  
- **When** the reviewer attempts to submit a review  
- **Then** the system displays a submission closed error  
  **And** the review is not submitted

### AT-UC-12-04 — Database Failure
**Covers**: Extension 7a

- **Given** a completed review is submitted  
- **When** the system fails while storing the review  
- **Then** the system displays a review submission failure message  
  **And** the review is not stored

### AT-UC-12-05 — Review Availability to Editor
**Covers**: Success End Condition

- **Given** a review is successfully submitted  
- **Then** the editor can access the completed review in the system

---

*UC-12 status: COMPLETE*

# UC-13 — Store and Forward Reviews

## Source User Story
**US-13**: As the system, I want to store submitted reviews and forward them to the editor so that decisions can be made.

---

## Use Case (Cockburn Style)

**Goal in Context**: Ensure that submitted reviews are securely stored and made available to the editor for decision-making.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: System  
**Secondary Actors**: CMS Database, Editor Notification System  
**Trigger**: A reviewer submits a completed review.

### Success End Condition
* The submitted review is stored successfully and made accessible to the editor for evaluation.

### Failed End Condition
* The review is not stored or not accessible to the editor, preventing decision-making.

### Preconditions
* A reviewer has submitted a completed review.
* The review submission period is open.
* The paper exists in the CMS.

### Main Success Scenario
1. A completed review is submitted by a reviewer.
2. The system receives the submitted review data.
3. The system validates the integrity of the review submission.
4. The system stores the review in the CMS database.
5. The system associates the review with the correct paper and reviewer.
6. The system makes the stored review accessible to the editor.
7. The system confirms that the review has been successfully processed.

### Extensions
* **3a**: The submitted review data is incomplete or corrupted.  
  * **3a1**: The system rejects the review and reports a submission error.
* **4a**: The system cannot store the review due to a database error.  
  * **4a1**: The system reports a storage failure and prevents the review from being recorded.
* **6a**: The system cannot make the review accessible to the editor due to a system error.  
  * **6a1**: The system reports an access failure and flags the review for administrative attention.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Timing and method of notifying editors about newly available reviews are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
After a reviewer submits a completed review, the Conference Management System receives the review data and verifies that it is complete and uncorrupted. The system stores the review securely in the CMS database and links it to the appropriate paper and reviewer.

Once stored, the system makes the review accessible to the editor through the CMS interface. The system confirms that the review has been successfully processed, allowing the editor to use it for decision-making.

### Alternative Scenario 3a — Invalid Review Data
The system receives a submitted review that is incomplete or corrupted. During validation, the system detects the issue.

The system rejects the review and reports a submission error. The review is not stored.

### Alternative Scenario 4a — Database Error
The system receives a valid review submission. While attempting to store the review, the system encounters a database error.

The system reports a storage failure and prevents the review from being recorded. The review is not accessible to the editor.

### Alternative Scenario 6a — Editor Access Failure
The system successfully stores a review but encounters an error while making the review accessible to the editor.

The system reports an access failure and flags the review for administrative attention. The editor cannot access the review.

---

## Acceptance Test Suite

### AT-UC-13-01 — Successful Review Storage and Access
**Covers**: Main Success Scenario

- **Given** a completed review is submitted  
- **When** the system processes the review  
- **Then** the system stores the review  
  **And** associates it with the correct paper  
  **And** makes it accessible to the editor

### AT-UC-13-02 — Invalid Review Submission
**Covers**: Extension 3a

- **Given** a submitted review is incomplete or corrupted  
- **When** the system processes the review  
- **Then** the system rejects the review  
  **And** reports a submission error

### AT-UC-13-03 — Database Failure
**Covers**: Extension 4a

- **Given** a valid review is submitted  
- **When** the system fails while storing the review  
- **Then** the system reports a storage failure  
  **And** the review is not recorded

### AT-UC-13-04 — Editor Access Failure
**Covers**: Extension 6a

- **Given** a review is successfully stored  
- **When** the system fails to make the review accessible  
- **Then** the system reports an access failure  
  **And** the editor cannot access the review

### AT-UC-13-05 — Review Availability for Decisions
**Covers**: Success End Condition

- **Given** a review is successfully processed  
- **Then** the editor can access the review to make decisions

---

*UC-13 status: COMPLETE*

# UC-14 — Make Accept/Reject Decision

## Source User Story
**US-14**: As an editor, I want to make an accept/reject decision once all reviews are submitted so that authors are informed.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow an editor to make an accept or reject decision for a paper after all assigned reviews have been submitted.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Editor  
**Secondary Actors**: CMS Database, Author Notification System  
**Trigger**: All assigned reviews for a paper have been submitted.

### Success End Condition
* An accept or reject decision is recorded for the paper and can be communicated to the authors.

### Failed End Condition
* No decision is recorded, and the authors are not informed of the paper’s outcome.

### Preconditions
* The editor is registered and logged into the CMS.
* The paper has all required reviews submitted.
* The decision period is open.

### Main Success Scenario
1. The editor accesses the list of papers awaiting decisions.
2. The editor selects a paper.
3. The system displays the paper details and submitted reviews.
4. The editor selects either “Accept” or “Reject.”
5. The editor confirms the decision.
6. The system validates that all required reviews are present.
7. The system records the decision in the CMS database.
8. The system confirms that the decision has been successfully recorded.

### Extensions
* **2a**: The selected paper does not have all required reviews submitted.  
  * **2a1**: The system displays an error message indicating that a decision cannot be made until all reviews are submitted.
* **6a**: The system cannot validate review completeness due to a system error.  
  * **6a1**: The system displays an error message indicating validation failure and prevents decision recording.
* **7a**: The system cannot store the decision due to a database error.  
  * **7a1**: The system displays an error message indicating decision recording failed and advises the editor to try again later.

### Related Information
* **Priority**: High  
* **Frequency**: Medium  
* **Open Issues**: Decision criteria and tie-breaking rules are referenced but not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
An editor logs into the Conference Management System and views papers that are ready for decision. The editor selects a paper and reviews the submitted evaluations provided by the reviewers.

After considering the reviews, the editor chooses to accept or reject the paper and confirms the decision. The system verifies that all required reviews are present, records the decision in the CMS database, and confirms that the decision has been successfully saved.

### Alternative Scenario 2a — Reviews Not Complete
The editor selects a paper that does not yet have all required reviews submitted. When attempting to make a decision, the system detects incomplete reviews.

The system displays an error message indicating that a decision cannot be made until all reviews are submitted. No decision is recorded.

### Alternative Scenario 6a — Review Validation Error
The editor attempts to make a decision on a paper with completed reviews. During validation, the system encounters an error while checking review completeness.

The system displays an error message indicating that validation failed and prevents the decision from being recorded.

### Alternative Scenario 7a — Database Error
The editor confirms a valid decision for a paper. While attempting to store the decision, the system encounters a database error.

The system displays an error message informing the editor that the decision could not be recorded due to a system issue and advises them to try again later. No decision is stored.

---

## Acceptance Test Suite

### AT-UC-14-01 — Successful Decision Recording
**Covers**: Main Success Scenario

- **Given** all required reviews for a paper are submitted  
- **When** the editor records an accept or reject decision  
- **Then** the system stores the decision  
  **And** confirms successful recording

### AT-UC-14-02 — Reviews Incomplete
**Covers**: Extension 2a

- **Given** a paper has missing reviews  
- **When** the editor attempts to make a decision  
- **Then** the system displays a reviews-incomplete error  
  **And** no decision is recorded

### AT-UC-14-03 — Review Validation Failure
**Covers**: Extension 6a

- **Given** reviews appear complete  
- **When** the system fails during review validation  
- **Then** the system displays a validation failure message  
  **And** no decision is recorded

### AT-UC-14-04 — Database Failure
**Covers**: Extension 7a

- **Given** a valid decision is confirmed  
- **When** the system fails while storing the decision  
- **Then** the system displays a decision failure message  
  **And** no decision is stored

### AT-UC-14-05 — Decision Availability
**Covers**: Success End Condition

- **Given** a decision is successfully recorded  
- **Then** the decision is available in the system for subsequent author notification

---

*UC-14 status: COMPLETE*

# UC-15 — Notify Authors

## Source User Story
**US-15**: As the system, I want to notify authors of acceptance or rejection so that they can plan accordingly.

---

## Use Case (Cockburn Style)

**Goal in Context**: Notify authors of the accept or reject decision for their paper so they can plan next steps.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: System  
**Secondary Actors**: Email System, CMS Database  
**Trigger**: An accept or reject decision is recorded for a paper.

### Success End Condition
* Authors are notified of the decision and can view the outcome for planning.

### Failed End Condition
* Authors are not notified, and the decision is not communicated.

### Preconditions
* A decision has been recorded for the paper.
* Authors have valid contact information registered in the system.

### Main Success Scenario
1. A decision is recorded for a paper.
2. The system retrieves the decision and associated author contact information.
3. The system generates a decision notification message for the authors.
4. The system sends the notification to the authors.
5. The system records that the notification was successfully sent.

### Extensions
* **2a**: One or more authors do not have valid contact information.  
  * **2a1**: The system skips notification for those authors and records a notification failure.
* **4a**: The email system fails to deliver the notification.  
  * **4a1**: The system records the notification failure and reports the issue for administrative review.
* **5a**: The system cannot record notification status due to a database error.  
  * **5a1**: The system reports a notification logging failure and advises administrative follow-up.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Notification timing, retries, and whether notifications include review feedback are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
After an editor records an accept or reject decision for a paper, the Conference Management System initiates the author notification process. The system retrieves the decision and the contact information for all authors associated with the paper.

The system generates a decision notification message and sends it to the authors through the email system. After sending, the system records that the notification was successfully delivered so the decision is formally communicated and authors can plan next steps.

### Alternative Scenario 2a — Missing or Invalid Author Contact Information
The system retrieves author information and determines that one or more authors have missing or invalid contact details.

The system skips sending notifications to those authors and records a notification failure. Those authors are not notified.

### Alternative Scenario 4a — Email Delivery Failure
The system generates a decision notification message but encounters an email system failure when attempting to send it.

The system records the notification failure and reports the issue for administrative review. Authors may not receive the decision notification.

### Alternative Scenario 5a — Notification Logging Failure
The system successfully sends the decision notification but encounters a database error while recording the notification status.

The system reports a notification logging failure and advises administrative follow-up. Authors may have been notified, but logging is incomplete.

---

## Acceptance Test Suite

### AT-UC-15-01 — Successful Author Notification
**Covers**: Main Success Scenario

- **Given** an accept or reject decision is recorded for a paper  
- **When** the system notifies the authors  
- **Then** the system sends the decision notification  
  **And** records that the notification was sent

### AT-UC-15-02 — Missing Author Contact Information
**Covers**: Extension 2a

- **Given** an author has missing or invalid contact information  
- **When** the system attempts to notify authors  
- **Then** the system skips that author  
  **And** records a notification failure

### AT-UC-15-03 — Email System Failure
**Covers**: Extension 4a

- **Given** valid author contact information exists  
- **When** the email system fails during notification  
- **Then** the system records the notification failure  
  **And** reports the issue for administrative review

### AT-UC-15-04 — Notification Logging Failure
**Covers**: Extension 5a

- **Given** decision notifications are sent  
- **When** the system fails to record notification status  
- **Then** the system reports a logging failure  
  **And** advises administrative follow-up

### AT-UC-15-05 — Notification Communicates Outcome
**Covers**: Success End Condition

- **Given** authors are successfully notified  
- **Then** authors can access or reference the decision outcome for planning

---

*UC-15 status: COMPLETE*

# UC-16 — Generate Conference Schedule

## Source User Story
**US-16**: As an administrator, I want the system to generate a conference schedule so that accepted papers are assigned times and rooms.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow an administrator to generate a conference schedule that assigns accepted papers to available time slots and rooms.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Administrator  
**Secondary Actors**: CMS Database, Scheduling Engine  
**Trigger**: The administrator selects the “Generate Schedule” option in the CMS.

### Success End Condition
* A conference schedule is generated and stored, assigning accepted papers to times and rooms.

### Failed End Condition
* No schedule is generated, and accepted papers remain unassigned to times or rooms.

### Preconditions
* The administrator is registered and logged into the CMS.
* The list of accepted papers is finalized.
* Conference rooms and available time slots are defined in the system.

### Main Success Scenario
1. The administrator selects the “Generate Schedule” option.
2. The system retrieves the list of accepted papers.
3. The system retrieves available rooms and time slots.
4. The system applies scheduling constraints to assign papers to rooms and time slots.
5. The system generates a complete schedule.
6. The system stores the generated schedule in the CMS database.
7. The system confirms that the schedule has been generated successfully.

### Extensions
* **2a**: No accepted papers are available for scheduling.  
  * **2a1**: The system displays a message indicating there are no accepted papers to schedule and stops processing.
* **3a**: No rooms or time slots are available.  
  * **3a1**: The system displays an error message indicating scheduling resources are missing and stops processing.
* **4a**: Scheduling constraints cannot be satisfied.  
  * **4a1**: The system displays an error message indicating conflicts or constraints prevent schedule generation.
* **6a**: The system cannot store the schedule due to a database error.  
  * **6a1**: The system displays an error message indicating schedule generation failed and advises the administrator to try again later.

### Related Information
* **Priority**: High  
* **Frequency**: Medium  
* **Open Issues**: The full set of scheduling constraints and conflict resolution rules are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
An administrator logs into the Conference Management System after paper decisions are finalized and scheduling resources have been configured. The administrator initiates scheduling by selecting the **Generate Schedule** option.

The system retrieves all accepted papers along with the available rooms and time slots. The system applies scheduling constraints to allocate each accepted paper to an appropriate room and time slot, generating a complete conference schedule.

After generating the schedule, the system stores it in the CMS database and confirms that schedule generation was successful.

### Alternative Scenario 2a — No Accepted Papers
The administrator selects the **Generate Schedule** option. The system retrieves the list of accepted papers and determines that there are none available.

The system displays a message indicating that there are no accepted papers to schedule and stops processing. No schedule is generated.

### Alternative Scenario 3a — No Rooms or Time Slots
The administrator initiates schedule generation, but the system determines that no rooms or time slots are available in the system.

The system displays an error message indicating that scheduling resources are missing and stops processing. No schedule is generated.

### Alternative Scenario 4a — Constraints Cannot Be Satisfied
The system retrieves accepted papers and available scheduling resources, then attempts to apply scheduling constraints. The system determines that conflicts or constraints prevent a complete schedule from being generated.

The system displays an error message indicating that schedule generation cannot be completed due to conflicts or unsatisfied constraints. No schedule is generated.

### Alternative Scenario 6a — Database Error
The system generates a schedule successfully but encounters a database error while attempting to store it.

The system displays an error message indicating that schedule generation failed due to a system issue and advises the administrator to try again later. The schedule is not stored.

---

## Acceptance Test Suite

### AT-UC-16-01 — Successful Schedule Generation
**Covers**: Main Success Scenario

- **Given** accepted papers exist and rooms and time slots are defined  
- **When** the administrator generates the schedule  
- **Then** the system assigns accepted papers to rooms and time slots  
  **And** stores the generated schedule  
  **And** confirms success

### AT-UC-16-02 — No Accepted Papers
**Covers**: Extension 2a

- **Given** no accepted papers exist  
- **When** the administrator attempts to generate a schedule  
- **Then** the system displays a no-accepted-papers message  
  **And** no schedule is generated

### AT-UC-16-03 — No Scheduling Resources
**Covers**: Extension 3a

- **Given** rooms or time slots are not defined  
- **When** the administrator attempts to generate a schedule  
- **Then** the system displays a scheduling resources error  
  **And** no schedule is generated

### AT-UC-16-04 — Unsatisfied Constraints
**Covers**: Extension 4a

- **Given** accepted papers and scheduling resources exist  
- **When** scheduling constraints cannot be satisfied  
- **Then** the system displays a constraints conflict error  
  **And** no schedule is generated

### AT-UC-16-05 — Database Failure
**Covers**: Extension 6a

- **Given** a schedule is generated  
- **When** the system fails while storing the schedule  
- **Then** the system displays a schedule generation failure message  
  **And** no schedule is stored

### AT-UC-16-06 — Schedule Completeness
**Covers**: Success End Condition

- **Given** a schedule is successfully generated  
- **Then** all accepted papers have assigned times and rooms in the schedule

---

*UC-16 status: COMPLETE*

# UC-17 — Modify Conference Schedule

## Source User Story
**US-17**: As an editor, I want to modify the generated schedule so that conflicts and constraints are resolved.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow an editor to manually modify the generated conference schedule to resolve conflicts and satisfy scheduling constraints.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Editor  
**Secondary Actors**: CMS Database  
**Trigger**: The editor selects the “Modify Schedule” option for an existing conference schedule.

### Success End Condition
* The schedule is successfully modified, stored, and reflects resolved conflicts and constraints.

### Failed End Condition
* The schedule is not modified, and conflicts or constraints remain unresolved.

### Preconditions
* The editor is registered and logged into the CMS.
* A conference schedule has already been generated.
* The schedule is editable.

### Main Success Scenario
1. The editor accesses the existing conference schedule.
2. The editor selects the “Modify Schedule” option.
3. The system displays the current schedule with editable time and room assignments.
4. The editor adjusts paper assignments to resolve conflicts or constraints.
5. The editor saves the modified schedule.
6. The system validates that the modified schedule satisfies required constraints.
7. The system stores the updated schedule in the CMS database.
8. The system confirms that the schedule has been successfully updated.

### Extensions
* **4a**: The editor introduces a new scheduling conflict.  
  * **4a1**: The system displays an error message indicating the conflict and prevents saving.
* **6a**: The modified schedule violates required constraints.  
  * **6a1**: The system displays an error message indicating constraint violations and prevents saving.
* **7a**: The system cannot store the modified schedule due to a database error.  
  * **7a1**: The system displays an error message indicating schedule update failed and advises the editor to try again later.

### Related Information
* **Priority**: High  
* **Frequency**: Medium  
* **Open Issues**: The exact set of editable constraints and conflict detection rules are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
An editor logs into the Conference Management System after a schedule has been generated. The editor reviews the schedule and identifies conflicts or constraint violations that require manual adjustment.

The editor selects the **Modify Schedule** option and updates time or room assignments to resolve the issues. After saving the changes, the system validates the updated schedule, stores it in the CMS database, and confirms that the schedule has been successfully updated.

### Alternative Scenario 4a — New Conflict Introduced
The editor modifies the schedule but creates a new conflict, such as assigning two papers to the same room at the same time.

The system detects the conflict and displays an error message indicating the issue. The system prevents the schedule from being saved.

### Alternative Scenario 6a — Constraint Violation
The editor attempts to save a modified schedule that violates required constraints, such as room capacity or unavailable time slots.

The system displays an error message indicating the constraint violations and prevents saving the modified schedule.

### Alternative Scenario 7a — Database Error
The editor saves a valid modified schedule. While storing the updated schedule, the system encounters a database error.

The system displays an error message informing the editor that the schedule update failed due to a system issue and advises them to try again later. The schedule is not stored.

---

## Acceptance Test Suite

### AT-UC-17-01 — Successful Schedule Modification
**Covers**: Main Success Scenario

- **Given** a generated schedule exists  
- **When** the editor modifies and saves the schedule without conflicts  
- **Then** the system stores the updated schedule  
  **And** confirms successful update

### AT-UC-17-02 — Conflict Introduced
**Covers**: Extension 4a

- **Given** an editable schedule is displayed  
- **When** the editor introduces a scheduling conflict  
- **Then** the system displays a conflict error  
  **And** prevents saving the schedule

### AT-UC-17-03 — Constraint Violation
**Covers**: Extension 6a

- **Given** an editable schedule is displayed  
- **When** the editor violates required scheduling constraints  
- **Then** the system displays a constraint violation error  
  **And** prevents saving the schedule

### AT-UC-17-04 — Database Failure
**Covers**: Extension 7a

- **Given** valid schedule modifications are made  
- **When** the system fails while storing the updated schedule  
- **Then** the system displays a schedule update failure message  
  **And** the schedule remains unchanged

### AT-UC-17-05 — Schedule Integrity
**Covers**: Success End Condition

- **Given** the schedule is successfully modified  
- **Then** the schedule reflects resolved conflicts and constraints

---

*UC-17 status: COMPLETE*

# UC-18 — Publish Final Schedule

## Source User Story
**US-18**: As the system, I want to publish the final schedule to authors and the CMS webpage so that attendees are informed.

---

## Use Case (Cockburn Style)

**Goal in Context**: Publish the finalized conference schedule so it is visible to authors and publicly accessible on the CMS webpage.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: System  
**Secondary Actors**: CMS Database, Web Publishing System, Author Notification System  
**Trigger**: The conference schedule is marked as final.

### Success End Condition
* The final schedule is published on the CMS webpage and made available to authors.

### Failed End Condition
* The schedule is not published, and authors and attendees cannot access final scheduling information.

### Preconditions
* A conference schedule has been finalized and approved.
* The CMS webpage is available for publishing.

### Main Success Scenario
1. The conference schedule is marked as final.
2. The system retrieves the finalized schedule.
3. The system publishes the schedule to the CMS webpage.
4. The system makes the schedule accessible to authors through the CMS.
5. The system confirms that the schedule has been successfully published.

### Extensions
* **2a**: The finalized schedule cannot be retrieved due to a system error.  
  * **2a1**: The system reports a schedule retrieval failure and stops publishing.
* **3a**: The system cannot publish the schedule to the CMS webpage due to a publishing error.  
  * **3a1**: The system reports a publishing failure and stops processing.
* **4a**: The system cannot make the schedule accessible to authors due to a system error.  
  * **4a1**: The system reports an access failure and flags the issue for administrative review.

### Related Information
* **Priority**: High  
* **Frequency**: Low  
* **Open Issues**: Whether notifications are sent to authors upon publication is not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
After the conference schedule has been finalized, the Conference Management System initiates the publication process. The system retrieves the finalized schedule and publishes it to the CMS webpage for public viewing.

The system also makes the schedule accessible to authors through their CMS accounts. Once publishing is complete, the system confirms that the final schedule has been successfully published so attendees and authors can view it.

### Alternative Scenario 2a — Schedule Retrieval Failure
The system attempts to retrieve the finalized schedule but encounters a system error.

The system reports a schedule retrieval failure and stops the publishing process. The schedule is not published.

### Alternative Scenario 3a — Web Publishing Failure
The system retrieves the finalized schedule but encounters an error while publishing it to the CMS webpage.

The system reports a publishing failure and stops processing. The schedule is not publicly visible.

### Alternative Scenario 4a — Author Access Failure
The system successfully publishes the schedule to the CMS webpage but encounters an error while making it accessible to authors through the CMS.

The system reports an access failure and flags the issue for administrative review. Authors cannot access the schedule.

---

## Acceptance Test Suite

### AT-UC-18-01 — Successful Schedule Publication
**Covers**: Main Success Scenario

- **Given** a finalized conference schedule exists  
- **When** the system publishes the schedule  
- **Then** the schedule is published on the CMS webpage  
  **And** is accessible to authors

### AT-UC-18-02 — Schedule Retrieval Failure
**Covers**: Extension 2a

- **Given** the finalized schedule cannot be retrieved  
- **When** the system attempts to publish the schedule  
- **Then** the system reports a retrieval failure  
  **And** the schedule is not published

### AT-UC-18-03 — Web Publishing Failure
**Covers**: Extension 3a

- **Given** a finalized schedule exists  
- **When** the system fails to publish it to the CMS webpage  
- **Then** the system reports a publishing failure  
  **And** the schedule is not publicly visible

### AT-UC-18-04 — Author Access Failure
**Covers**: Extension 4a

- **Given** the schedule is published on the CMS webpage  
- **When** the system fails to make it accessible to authors  
- **Then** the system reports an access failure  
  **And** authors cannot access the schedule

### AT-UC-18-05 — Schedule Visibility
**Covers**: Success End Condition

- **Given** the final schedule is successfully published  
- **Then** authors and attendees can view the conference schedule

---

*UC-18 status: COMPLETE*

# UC-19 — View Conference Pricing

## Source User Story
**US-19**: As a guest or registered user, I want to view conference pricing so that I know the cost of attendance.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow a guest or registered user to view current conference pricing information to understand the cost of attendance.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Guest or Registered User  
**Secondary Actors**: CMS Database  
**Trigger**: The user selects the “View Pricing” option in the CMS.

### Success End Condition
* Conference pricing information is displayed to the user.

### Failed End Condition
* Pricing information is not displayed, and the user cannot view attendance costs.

### Preconditions
* The CMS pricing information exists.
* The CMS pricing page is available.

### Main Success Scenario
1. The user selects the “View Pricing” option.
2. The system retrieves current conference pricing information.
3. The system displays pricing details to the user.
4. The user reviews the pricing information.

### Extensions
* **2a**: Pricing information is not available.  
  * **2a1**: The system displays a message indicating that pricing information is currently unavailable.
* **3a**: The system encounters an error while retrieving pricing information.  
  * **3a1**: The system displays an error message indicating pricing could not be retrieved and advises the user to try again later.

### Related Information
* **Priority**: Medium  
* **Frequency**: High  
* **Open Issues**: Whether pricing varies by attendee type or registration period is not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
A guest or registered user visits the Conference Management System and wants to determine the cost of attending the conference. The user selects the **View Pricing** option.

The system retrieves the current pricing information from the CMS database and displays it to the user. The user reviews the pricing details to understand attendance costs.

### Alternative Scenario 2a — Pricing Information Unavailable
The user selects the **View Pricing** option. The system determines that pricing information is not currently available.

The system displays a message indicating that pricing information is unavailable. No pricing details are shown.

### Alternative Scenario 3a — Pricing Retrieval Error
The user selects the **View Pricing** option. While retrieving pricing information, the system encounters an error.

The system displays an error message indicating that pricing information could not be retrieved and advises the user to try again later. No pricing details are shown.

---

## Acceptance Test Suite

### AT-UC-19-01 — Successful Pricing Display
**Covers**: Main Success Scenario

- **Given** pricing information exists  
- **When** the user selects the view pricing option  
- **Then** the system displays conference pricing details

### AT-UC-19-02 — Pricing Information Unavailable
**Covers**: Extension 2a

- **Given** pricing information does not exist  
- **When** the user attempts to view pricing  
- **Then** the system displays a pricing unavailable message

### AT-UC-19-03 — Pricing Retrieval Failure
**Covers**: Extension 3a

- **Given** pricing information exists  
- **When** the system fails while retrieving pricing data  
- **Then** the system displays a pricing retrieval error message

### AT-UC-19-04 — Pricing Visibility
**Covers**: Success End Condition

- **Given** pricing information is successfully retrieved  
- **Then** the user can view and review attendance costs

---

*UC-19 status: COMPLETE*

# UC-20 — Pay Registration Fee

## Source User Story
**US-20**: As an attendee, I want to pay the registration fee online so that I can attend the conference.

---

## Use Case (Cockburn Style)

**Goal in Context**: Allow an attendee to securely pay the conference registration fee online to complete their registration.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Attendee  
**Secondary Actors**: Payment Gateway, CMS Database  
**Trigger**: The attendee selects the “Pay Registration Fee” option in the CMS.

### Success End Condition
* The registration fee is successfully paid, and the attendee is marked as registered.

### Failed End Condition
* The payment is not completed, and the attendee is not registered.

### Preconditions
* The attendee is registered and logged into the CMS.
* Registration pricing is defined.
* Online payment services are available.

### Main Success Scenario
1. The attendee selects the “Pay Registration Fee” option.
2. The system displays the registration fee and payment options.
3. The attendee enters payment information.
4. The attendee submits the payment.
5. The system sends the payment information to the payment gateway.
6. The payment gateway confirms successful payment.
7. The system records the payment in the CMS database.
8. The system marks the attendee as registered.

### Extensions
* **3a**: The attendee enters invalid or incomplete payment information.  
  * **3a1**: The system displays an error message indicating invalid payment details and prompts the attendee to correct them.
* **6a**: The payment gateway rejects the payment.  
  * **6a1**: The system displays a payment failure message and prompts the attendee to try again or use a different payment method.
* **5a**: The system cannot communicate with the payment gateway.  
  * **5a1**: The system displays an error message indicating a payment service issue and advises the attendee to try again later.
* **7a**: The system cannot record the payment due to a database error.  
  * **7a1**: The system displays an error message indicating payment recording failed and advises the attendee to contact support.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Supported payment methods and refund policies are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
An attendee logs into the Conference Management System and proceeds to complete registration. The attendee selects the **Pay Registration Fee** option, and the system displays the required fee and available payment methods.

The attendee enters valid payment information and submits the payment. The system sends the information to the payment gateway, which confirms that the payment is successful. The system records the payment and marks the attendee as registered, allowing them to attend the conference.

### Alternative Scenario 3a — Invalid Payment Information
The attendee attempts to submit payment with invalid or incomplete payment details. The system detects the issue before sending the request to the payment gateway.

The system displays an error message prompting the attendee to correct the payment information. No payment is processed.

### Alternative Scenario 6a — Payment Rejected
The attendee submits valid payment information, but the payment gateway rejects the transaction.

The system displays a payment failure message and prompts the attendee to try again or use a different payment method. The attendee remains unregistered.

### Alternative Scenario 5a — Payment Gateway Unavailable
The attendee submits payment information, but the system cannot communicate with the payment gateway.

The system displays an error message indicating a payment service issue and advises the attendee to try again later. No payment is processed.

### Alternative Scenario 7a — Payment Recording Failure
The payment gateway confirms a successful payment, but the system encounters a database error while recording the payment.

The system displays an error message indicating that payment recording failed and advises the attendee to contact support. The attendee’s registration status is not updated.

---

## Acceptance Test Suite

### AT-UC-20-01 — Successful Payment
**Covers**: Main Success Scenario

- **Given** the attendee is logged in and registration pricing exists  
- **When** the attendee submits valid payment information  
- **Then** the system records the payment  
  **And** marks the attendee as registered

### AT-UC-20-02 — Invalid Payment Information
**Covers**: Extension 3a

- **Given** the payment form is displayed  
- **When** the attendee submits invalid or incomplete payment details  
- **Then** the system displays a payment input error  
  **And** no payment is processed

### AT-UC-20-03 — Payment Rejected
**Covers**: Extension 6a

- **Given** valid payment information is submitted  
- **When** the payment gateway rejects the payment  
- **Then** the system displays a payment failure message  
  **And** the attendee is not registered

### AT-UC-20-04 — Payment Gateway Unavailable
**Covers**: Extension 5a

- **Given** valid payment information is submitted  
- **When** the payment gateway is unavailable  
- **Then** the system displays a payment service error  
  **And** no payment is processed

### AT-UC-20-05 — Payment Recording Failure
**Covers**: Extension 7a

- **Given** a payment is confirmed by the payment gateway  
- **When** the system fails while recording the payment  
- **Then** the system displays a payment recording failure message  
  **And** the attendee is not marked as registered

### AT-UC-20-06 — Registration Completion
**Covers**: Success End Condition

- **Given** payment is successfully recorded  
- **Then** the attendee is registered and eligible to attend the conference

---

*UC-20 status: COMPLETE*

# UC-21 — Receive Payment Confirmation and Ticket

## Source User Story
**US-21**: As an attendee, I want to receive a payment confirmation and ticket so that I can prove my registration.

---

## Use Case (Cockburn Style)

**Goal in Context**: Provide an attendee with a payment confirmation and ticket after successful registration payment so they can prove their registration.  
**Scope**: Conference Management System (CMS)  
**Level**: User Goal  
**Primary Actor**: Attendee  
**Secondary Actors**: Email System, CMS Database, Ticket Generation System  
**Trigger**: A registration payment is successfully completed.

### Success End Condition
* The attendee receives a payment confirmation and a ticket, and the ticket is available for proof of registration.

### Failed End Condition
* The attendee does not receive a confirmation or ticket and cannot prove registration.

### Preconditions
* The attendee has successfully completed registration payment.
* The attendee has valid contact information registered in the system.

### Main Success Scenario
1. A registration payment is successfully completed.
2. The system generates a payment confirmation record.
3. The system generates a ticket for the attendee.
4. The system stores the confirmation and ticket in the CMS database.
5. The system sends the payment confirmation and ticket to the attendee.
6. The system confirms that the confirmation and ticket were successfully delivered.

### Extensions
* **3a**: The system cannot generate a ticket due to a system error.  
  * **3a1**: The system reports a ticket generation failure and prevents delivery.
* **4a**: The system cannot store the confirmation or ticket due to a database error.  
  * **4a1**: The system reports a storage failure and prevents delivery.
* **5a**: The email system fails to deliver the confirmation or ticket.  
  * **5a1**: The system records a delivery failure and advises administrative follow-up.

### Related Information
* **Priority**: High  
* **Frequency**: High  
* **Open Issues**: Ticket format, QR code usage, and re-delivery policies are not fully specified in the SRS.

---

## Fully Dressed Scenario Narratives

### Main Success Scenario Narrative
After an attendee successfully completes the registration payment, the Conference Management System initiates the confirmation process. The system generates a payment confirmation and creates a ticket associated with the attendee’s registration.

The system stores the confirmation and ticket in the CMS database and sends them to the attendee via the email system. The system confirms successful delivery, enabling the attendee to use the ticket as proof of registration.

### Alternative Scenario 3a — Ticket Generation Failure
The attendee completes payment successfully, but the system encounters an error while generating the ticket.

The system reports a ticket generation failure and prevents delivery of the confirmation and ticket. The attendee does not receive proof of registration.

### Alternative Scenario 4a — Storage Failure
The system generates a confirmation and ticket but encounters a database error while attempting to store them.

The system reports a storage failure and prevents delivery. The attendee does not receive the confirmation or ticket.

### Alternative Scenario 5a — Delivery Failure
The system successfully generates and stores the confirmation and ticket but encounters an email system failure during delivery.

The system records the delivery failure and advises administrative follow-up. The attendee may not receive the confirmation or ticket.

---

## Acceptance Test Suite

### AT-UC-21-01 — Successful Confirmation and Ticket Delivery
**Covers**: Main Success Scenario

- **Given** an attendee completes registration payment  
- **When** the system processes confirmation and ticket delivery  
- **Then** the system sends a payment confirmation  
  **And** sends a ticket to the attendee

### AT-UC-21-02 — Ticket Generation Failure
**Covers**: Extension 3a

- **Given** payment is successfully completed  
- **When** the system fails to generate a ticket  
- **Then** the system reports a ticket generation failure  
  **And** no confirmation or ticket is delivered

### AT-UC-21-03 — Storage Failure
**Covers**: Extension 4a

- **Given** a confirmation and ticket are generated  
- **When** the system fails while storing them  
- **Then** the system reports a storage failure  
  **And** no confirmation or ticket is delivered

### AT-UC-21-04 — Delivery Failure
**Covers**: Extension 5a

- **Given** a confirmation and ticket are generated and stored  
- **When** the email system fails during delivery  
- **Then** the system records a delivery failure  
  **And** the attendee may not receive the confirmation or ticket

### AT-UC-21-05 — Proof of Registration
**Covers**: Success End Condition

- **Given** the confirmation and ticket are successfully delivered  
- **Then** the attendee can present the ticket as proof of registration

---

*UC-21 status: COMPLETE*
