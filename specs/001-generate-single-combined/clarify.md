# Clarification Log — Combined CMS Specification

This document records clarifications raised during `/speckit.clarify` and their approved resolutions.
Clarifications formalize underspecified constraints without introducing new features, flows, or permissions.

## CLAR-01: Password Policy
**Source ambiguity**: Password constraints not specified in authoritative sources.
**Resolution**: Passwords must be at least 8 characters and include upper-case, lower-case, numeric, and special characters. Common passwords are blocked.
**Rationale**: Formalizes credential validation already implied by authentication flows (UC-01..UC-04).
**Approval**: User-approved during clarification.

## CLAR-02: Manuscript File Constraints
**Source ambiguity**: Allowed submission formats and size limits unspecified.
**Resolution**: Allowed formats are PDF, DOCX, and LaTeX ZIP; maximum size is 25 MB.
**Rationale**: Formalizes submission validation implied by UC-05 and UC-07.
**Approval**: User-approved during clarification.

## CLAR-03: Payment Methods
**Source ambiguity**: Supported payment methods not specified.
**Resolution**: Supported methods are credit/debit card and PayPal.
**Rationale**: Formalizes fee payment flow implied by UC-20.
**Approval**: User-approved during clarification.
