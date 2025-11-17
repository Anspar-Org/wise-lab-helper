# Engineering Notebook API

The Engineering Notebook API provides a complete solution for students to document their engineering process, following the 7-step methodology used in VEX IQ robotics competitions.

## Features

- **Entry Management**: Create, read, update, and delete notebook entries
- **File Uploads**: Attach images, videos, and PDFs to entries (max 10MB per file)
- **Entry Types**: Seven specialized entry types aligned with the engineering process
- **Tagging System**: Organize entries with custom tags
- **Search & Filter**: Powerful search and filtering capabilities
- **Team Collaboration**: Support for both individual and team entries
- **Authorization**: Role-based access control (Students, Coaches, Admins)
- **Pagination**: Efficient handling of large datasets

## Entry Types

The API supports seven entry types that align with the engineering design process:

1. **brainstorm** - Initial ideas and thoughts
2. **research** - Information gathering and analysis
3. **design** - Sketches, CAD models, and design plans
4. **build** - Construction photos and assembly notes
5. **test** - Test results, data, and observations
6. **reflection** - What worked, what didn't, lessons learned
7. **competition** - Competition results, match notes, and awards

## API Endpoints

### Base URL

All endpoints are prefixed with `/api/v1/notebook`

### Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notebook` | List entries (with filters) |
| GET | `/notebook/search` | Search entries by content |
| GET | `/notebook/:id` | Get single entry |
| POST | `/notebook` | Create new entry |
| PUT | `/notebook/:id` | Update entry |
| DELETE | `/notebook/:id` | Delete entry |
| POST | `/notebook/:id/media` | Upload media files |
| DELETE | `/notebook/:id/media/:filename` | Delete media file |

---

## Detailed Endpoint Documentation

### 1. List Entries

**GET** `/api/v1/notebook`

Retrieve entries based on user role and optional filters.

**Authorization:**
- Students: See own entries + team entries
- Coaches/Admins: See all entries

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `type` | string | Filter by entry type | `?type=design` |
| `tags` | string | Filter by tags (comma-separated, AND operation) | `?tags=robot,autonomous` |
| `team_id` | UUID | Filter by team | `?team_id=123e4567-e89b-12d3-a456-426614174000` |
| `date_from` | string | Start date (YYYY-MM-DD) | `?date_from=2024-01-01` |
| `date_to` | string | End date (YYYY-MM-DD) | `?date_to=2024-01-31` |
| `page` | number | Page number (for pagination) | `?page=2` |
| `limit` | number | Items per page | `?limit=20` |

**Example Request:**

```bash
curl -X GET 'https://api.example.com/api/v1/notebook?type=design&tags=robot' \
  -H 'Authorization: Bearer your-jwt-token'
```

**Example Response (without pagination):**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "author_id": "user-123",
    "team_id": "team-456",
    "title": "Robot Chassis Design",
    "content": "Today we designed the chassis for our robot...",
    "entry_type": "design",
    "entry_date": "2024-01-15T00:00:00.000Z",
    "tags": ["robot", "chassis", "design"],
    "media_urls": [
      "/uploads/notebook/abc123-sketch.jpg"
    ],
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**Example Response (with pagination):**

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### 2. Search Entries

**GET** `/api/v1/notebook/search`

Search entries by content (title and body text).

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (1-200 chars) |
| `type` | string | No | Filter by entry type |
| `author_id` | UUID | No | Filter by author |
| `team_id` | UUID | No | Filter by team |

**Example Request:**

```bash
curl -X GET 'https://api.example.com/api/v1/notebook/search?q=robot&type=design' \
  -H 'Authorization: Bearer your-jwt-token'
```

**Search Features:**
- Case-insensitive
- Partial matching
- Searches both title and content fields

---

### 3. Get Single Entry

**GET** `/api/v1/notebook/:id`

Retrieve a specific entry by ID.

**Parameters:**
- `id` (path) - Entry UUID

**Example Request:**

```bash
curl -X GET 'https://api.example.com/api/v1/notebook/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer your-jwt-token'
```

**Responses:**
- `200 OK` - Entry found and returned
- `404 Not Found` - Entry does not exist

---

### 4. Create Entry

**POST** `/api/v1/notebook`

Create a new notebook entry.

**Request Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | 1-500 characters |
| `content` | string | Yes | 1-50000 characters |
| `entry_type` | string | Yes | One of: brainstorm, research, design, build, test, reflection, competition |
| `tags` | string[] | No | Array of strings, each 1-50 chars |
| `entry_date` | string | No | ISO date, cannot be future, defaults to today |
| `team_id` | UUID | No | Team UUID or null for individual entries |

**Example Request:**

```bash
curl -X POST 'https://api.example.com/api/v1/notebook' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Robot Chassis Design",
    "content": "Today we designed and sketched the chassis for our robot. We decided to use a 4-wheel drive configuration...",
    "entry_type": "design",
    "tags": ["robot", "chassis", "4wd"],
    "team_id": "team-456"
  }'
```

**Example Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "author_id": "user-123",
  "team_id": "team-456",
  "title": "Robot Chassis Design",
  "content": "Today we designed and sketched the chassis...",
  "entry_type": "design",
  "entry_date": "2024-01-15T00:00:00.000Z",
  "tags": ["robot", "chassis", "4wd"],
  "media_urls": [],
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Responses:**
- `201 Created` - Entry created successfully
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated

---

### 5. Update Entry

**PUT** `/api/v1/notebook/:id`

Update an existing notebook entry.

**Parameters:**
- `id` (path) - Entry UUID

**Request Body:**

All fields are optional. Only provided fields will be updated.

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | string | 1-500 characters |
| `content` | string | 1-50000 characters |
| `entry_type` | string | Valid entry type |
| `tags` | string[] | Array of strings, each 1-50 chars |
| `entry_date` | string | ISO date, cannot be future |
| `team_id` | UUID | Team UUID or null |

**Note:** `author_id` cannot be changed and will be ignored if provided.

**Example Request:**

```bash
curl -X PUT 'https://api.example.com/api/v1/notebook/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Updated: Robot Chassis Design",
    "tags": ["robot", "chassis", "4wd", "revised"]
  }'
```

**Responses:**
- `200 OK` - Entry updated successfully
- `404 Not Found` - Entry does not exist
- `400 Bad Request` - Validation error

---

### 6. Delete Entry

**DELETE** `/api/v1/notebook/:id`

Delete a notebook entry.

**Authorization:**
- Students: Can only delete their own entries
- Coaches/Admins: Can delete any entry

**Parameters:**
- `id` (path) - Entry UUID

**Example Request:**

```bash
curl -X DELETE 'https://api.example.com/api/v1/notebook/123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer your-jwt-token'
```

**Example Response:**

```json
{
  "message": "Entry deleted successfully"
}
```

**Responses:**
- `200 OK` - Entry deleted successfully
- `404 Not Found` - Entry does not exist
- `403 Forbidden` - Not authorized to delete this entry

---

### 7. Upload Media

**POST** `/api/v1/notebook/:id/media`

Upload one or more media files to an entry.

**Parameters:**
- `id` (path) - Entry UUID

**Request:**
- Content-Type: `multipart/form-data`
- Single file: Use field name `file`
- Multiple files: Use field name `files` (max 5 files)

**File Constraints:**
- Max file size: 10MB per file
- Allowed formats: JPG, JPEG, PNG, GIF, MP4, MOV, PDF

**Example Request (Single File):**

```bash
curl -X POST 'https://api.example.com/api/v1/notebook/123e4567-e89b-12d3-a456-426614174000/media' \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'file=@/path/to/robot-sketch.jpg'
```

**Example Request (Multiple Files):**

```bash
curl -X POST 'https://api.example.com/api/v1/notebook/123e4567-e89b-12d3-a456-426614174000/media' \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'files=@/path/to/photo1.jpg' \
  -F 'files=@/path/to/photo2.jpg' \
  -F 'files=@/path/to/video.mp4'
```

**Example Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "author_id": "user-123",
  "title": "Robot Chassis Design",
  "content": "...",
  "entry_type": "design",
  "media_urls": [
    "/uploads/notebook/1705320000-abc123.jpg",
    "/uploads/notebook/1705320001-def456.jpg",
    "/uploads/notebook/1705320002-ghi789.mp4"
  ],
  ...
}
```

**Responses:**
- `200 OK` - Files uploaded successfully
- `400 Bad Request` - Invalid file type or size exceeded
- `404 Not Found` - Entry does not exist

**Error Examples:**

```json
{
  "error": "Bad Request",
  "message": "File size exceeds the maximum limit of 10MB"
}
```

```json
{
  "error": "Bad Request",
  "message": "Invalid file type. Only JPG, PNG, GIF, MP4, MOV, and PDF files are allowed."
}
```

---

### 8. Delete Media

**DELETE** `/api/v1/notebook/:id/media/:filename`

Delete a media file from an entry.

**Parameters:**
- `id` (path) - Entry UUID
- `filename` (path) - Media filename (e.g., `1705320000-abc123.jpg`)

**Example Request:**

```bash
curl -X DELETE 'https://api.example.com/api/v1/notebook/123e4567-e89b-12d3-a456-426614174000/media/1705320000-abc123.jpg' \
  -H 'Authorization: Bearer your-jwt-token'
```

**Example Response:**

```json
{
  "message": "Media file deleted successfully",
  "entry": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "media_urls": [
      "/uploads/notebook/1705320002-ghi789.mp4"
    ],
    ...
  }
}
```

**Note:** This endpoint deletes both the database reference AND the physical file from the filesystem.

---

## Usage Examples

### Complete Workflow Example

```javascript
// 1. Create an entry
const createResponse = await fetch('https://api.example.com/api/v1/notebook', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Robot Build Session',
    content: 'Today we assembled the drivetrain...',
    entry_type: 'build',
    tags: ['robot', 'drivetrain', 'assembly']
  })
});

const entry = await createResponse.json();

// 2. Upload photos
const formData = new FormData();
formData.append('files', photoFile1);
formData.append('files', photoFile2);

const uploadResponse = await fetch(
  `https://api.example.com/api/v1/notebook/${entry.id}/media`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }
);

const updatedEntry = await uploadResponse.json();

// 3. Search for entries
const searchResponse = await fetch(
  'https://api.example.com/api/v1/notebook/search?q=drivetrain',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const searchResults = await searchResponse.json();

// 4. List all design entries
const listResponse = await fetch(
  'https://api.example.com/api/v1/notebook?type=design&limit=20&page=1',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const paginatedResults = await listResponse.json();
```

---

## Authorization Rules

### Students
- Can create entries
- Can view own entries + team entries
- Can update own entries only
- Can delete own entries only
- Can upload media to own entries
- Can delete media from own entries

### Coaches
- Full access to all entries
- Can create entries
- Can view all entries
- Can update any entry
- Can delete any entry
- Can upload/delete media on any entry

### Admins
- Same permissions as Coaches
- Full administrative access

---

## File Storage

Media files are stored in the local filesystem at:

```
./uploads/notebook/
```

Files are named using the format:

```
{timestamp}-{random-string}.{extension}
```

Example: `1705320000-abc123.jpg`

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {} // Optional additional details
}
```

### Common Error Codes

| Status | Error Type | Description |
|--------|------------|-------------|
| 400 | Bad Request | Validation error or malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Server-side error |

---

## Data Validation

### Title
- Required
- 1-500 characters
- Trimmed

### Content
- Required
- 1-50000 characters
- Trimmed

### Entry Type
- Required
- Must be one of: `brainstorm`, `research`, `design`, `build`, `test`, `reflection`, `competition`

### Tags
- Optional
- Array of strings
- Each tag: 1-50 characters
- Trimmed

### Entry Date
- Optional (defaults to today)
- Valid date format
- Cannot be in the future

### Team ID
- Optional
- Must be a valid UUID
- Can be null for individual entries

---

## Performance Considerations

### Pagination

For large datasets, use pagination:

```
GET /api/v1/notebook?page=1&limit=20
```

Default limit: 20 items per page

### Filtering

Apply filters to reduce result set size:

```
GET /api/v1/notebook?type=design&date_from=2024-01-01&date_to=2024-01-31
```

### Tag Searching

Tag filters use AND operation (entry must have ALL specified tags):

```
GET /api/v1/notebook?tags=robot,autonomous
```

Returns only entries that have BOTH "robot" AND "autonomous" tags.

---

## Testing

Run tests with:

```bash
npm test -- notebook
```

Run with coverage:

```bash
npm run test:coverage
```

Target coverage: >90%

---

## Implementation Notes

### Service Layer (`notebook.service.ts`)
- Contains all business logic
- Handles database interactions
- Performs authorization checks
- Manages file references

### Controller Layer (`notebook.controller.ts`)
- Handles HTTP requests/responses
- Validates authentication
- Delegates to service layer
- Formats responses

### Validation (`notebook.validation.ts`)
- Zod schemas for runtime validation
- Request body validation
- Query parameter validation
- Path parameter validation

### File Upload (`file-upload.middleware.ts`)
- Multer configuration
- File type validation
- Size limit enforcement
- Unique filename generation

### Routes (`notebook.routes.ts`)
- Express route definitions
- Middleware composition
- Authentication requirements
- Validation rules

---

## Future Enhancements

Potential future improvements:

1. **Rich Text Support**: Add markdown or rich text formatting
2. **Entry Templates**: Pre-defined templates for different entry types
3. **Collaborative Editing**: Real-time collaboration on entries
4. **Version History**: Track changes to entries over time
5. **Export Functionality**: Export notebook as PDF or HTML
6. **Media Thumbnails**: Generate thumbnails for images and videos
7. **Cloud Storage**: Support for S3 or other cloud storage providers
8. **Entry Sharing**: Share entries with specific users or teams

---

## Support

For issues or questions:
- File an issue in the repository
- Contact the development team
- Refer to the main API documentation
