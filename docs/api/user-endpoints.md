# User API Endpoints

Base URL: `/api/v1/users`

Authentication: Bearer Token (Firebase ID Token)

## Onboarding & Profile

### Onboard User
Completes the user registration process by creating a profile and optionally joining/creating an organization.

- **URL**: `/onboard`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `photo` (File, Optional): Profile picture image.
    - `email` (String, Required): User email.
    - `displayName` (String, Required): Full name.
    - `writingStyle` (String, Optional): Preferred writing style.
    - `createOrganization` (Boolean, Optional): Create a new org?
    - `organizationName` (String, Optional): Name of org if creating one.
    - `...` (Other profile fields)

### Get Current Profile
Retrieve the profile of the currently authenticated user.

- **URL**: `/me`
- **Method**: `GET`
- **Success Response**: 
    - `200 OK` with User object.
    - If user exists in Auth but not in Database (not onboarded): `200 OK` with `{ ..., isOnboarded: false }`.

### Update Profile
Update details of the current user.

- **URL**: `/me`
- **Method**: `PATCH`
- **Body Parameters**: (JSON)
    - Any writable User schema field (e.g., `bio`, `displayName`, `preferences`).

## Selective Resume Import

Resume import is a two-step, review-first workflow. Uploaded files are parsed in memory and are not saved to Firebase Storage.

### Preview Resume

Extract selected categories without modifying the profile.

- **URL**: `/me/resume/preview`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `file` (File, Required): PDF, DOCX, or plain-text resume, up to 10 MB.
    - `sections` (JSON String, Required): Any selection of `basics`, `summary`, `skills`, `experience`, `education`, `projects`, and `socialLinks`.
- **Success Response**: `200 OK` with normalized extracted data for review. This endpoint never writes profile data.

### Apply Resume Selection

Persist only the fields and records explicitly selected in the review UI.

- **URL**: `/me/resume/apply`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body Parameters**:
    - `profile` (Object, Optional): Selected scalar fields, skills, expertise, and social links.
    - `experience` (Array, Optional): Selected company/role records.
    - `education` (Array, Optional): Selected education records.
    - `projects` (Array, Optional): Selected project records.
- **Behavior**: Skills are merged without duplicates. Existing experience, education, and projects with matching identities are skipped rather than duplicated.
- **Success Response**: `200 OK` with profile-update, created-record, and skipped-duplicate counts.

## Media Management

### Update Profile Picture
Update the currently authenticated user's profile picture.

- **URL**: `/me/photo`
- **Method**: `PATCH`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `file` (File, Required): The image file.
- **Success Response**: `200 OK` with updated User object.

### Update Cover Photo
Update the currently authenticated user's cover photo.

- **URL**: `/me/cover`
- **Method**: `PATCH`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `file` (File, Required): The image file.
- **Success Response**: `200 OK` with updated User object.

### Add Gallery Asset
Add a photo or video to the user's gallery.

- **URL**: `/me/gallery`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
    - `file` (File, Required): The image or video file.
    - `title` (String, Optional): Title for the asset.
    - `description` (String, Optional): Description for the asset.
- **Success Response**: `200 OK` with updated User object.

### Delete Gallery Asset
Remove an asset from the user's gallery and storage.

- **URL**: `/me/gallery`
- **Method**: `DELETE`
- **Body Parameters**:
    - `assetUrl` (String, Required): The full URL of the asset to delete.
- **Success Response**: `200 OK` with updated User object.

## User Management

### Get User by ID
Fetch a user's public profile details.

- **URL**: `/:id`
- **Method**: `GET`
- **Success Response**: `200 OK` with User object.
- **Error Response**: `404 Not Found` if user does not exist or is deactivated.

### List Users (Admin)
Get a list of all users, optionally filtered.

- **URL**: `/`
- **Method**: `GET`
- **Query Params**:
    - `role` (optional): Filter by role.
    - `status` (optional): Filter by status.

## Status Management

### Deactivate User
Soft delete a user account (Self or Admin).

- **URL**: `/:id/deactivate`
- **Method**: `PATCH`

### Disable User (Admin)
Ban a user account.

- **URL**: `/:id/disable`
- **Method**: `PATCH`

### Activate User (Admin)
Unban/Reactivate a user account.

- **URL**: `/:id/activate`
- **Method**: `PATCH`
