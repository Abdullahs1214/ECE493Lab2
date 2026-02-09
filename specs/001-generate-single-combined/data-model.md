# Data Model

This data model is derived strictly from `cms_user_stories.md` and
`Use Cases_Scenarios_ATs.md`. Fields are limited to terms explicitly
referenced in those sources.

## Entities

### User Account

**Description**: Registered user identity used to access CMS features.

**Fields**:
- Email address
- Password

**Relationships**:
- A user can submit papers.
- A user can be assigned as a reviewer.
- An attendee is a user who completes registration payment.

**Validations**:
- Email must be correctly formatted and unique.
- Password must meet the configured policy (minimum 8 characters, includes upper/lowercase letters, a number, and a symbol, and blocks common passwords).

---

### Paper Submission

**Description**: Author-submitted paper with metadata and manuscript file.

**Fields**:
- Submission metadata
- Manuscript file

**Relationships**:
- Each submission belongs to an author (user account).
- Each submission can have multiple review assignments.

**Validations**:
- Required form fields present.
- Field values meet defined constraints.
- Manuscript file format and size limits enforced (PDF, DOCX, or LaTeX ZIP; max 25 MB).

---

### Review Assignment

**Description**: Assignment of a reviewer to a submitted paper.

**Fields**:
- Reviewer identity
- Paper submission reference

**Relationships**:
- Each assignment links one reviewer to one paper.

**Validations**:
- Reviewer workload limit enforced.

---

### Review

**Description**: Completed review form submitted by a reviewer for a paper.

**Fields**:
- Review form (structure unspecified in sources)

**Relationships**:
- Each review is tied to a review assignment and paper.

**Validations**:
- Review form must be complete per required fields.

---

### Editorial Decision

**Description**: Accept/reject decision for a paper after reviews are complete.

**Fields**:
- Decision outcome (accept/reject)

**Relationships**:
- Each decision belongs to a paper submission.

---

### Conference Schedule

**Description**: Published schedule with times and rooms for accepted papers.

**Fields**:
- Time assignment
- Room assignment

**Relationships**:
- Each scheduled item references an accepted paper.

**Validations**:
- Conflicts and constraints handled during generation/modification.

---

### Conference Pricing

**Description**: Published pricing for conference registration.

**Fields**:
- Registration fee

---

### Registration Payment

**Description**: Payment record for attendee registration.

**Fields**:
- Payment information
- Payment confirmation

**Relationships**:
- A payment is associated with an attendee.

**Validations**:
- Payment method supported (credit/debit card and PayPal).

---

### Ticket / Confirmation

**Description**: Proof of successful registration payment.

**Fields**:
- Ticket or confirmation details

**Relationships**:
- Issued to the attendee after successful payment.
