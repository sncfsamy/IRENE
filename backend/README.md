# IRENE BACKEND

### To start the backend in dev mode:

        cd _projet_/backend
        npm install
        npm run dev

## API references:

### User routes:

#### GET /users

Response:

```json
    [
        {
            "id": number,
            "firstname": string,
            "lastname": string,
            "registration_number": string,
            "mail": string,
            "id_manager": number,
            "organisation_id": number,
            "role_id": number
        }
        ...
    ]
```

### GET /users/:id

Response:

```json
    [
        {
            "id": number,
            "firstname": string,
            "lastname": string,
            "registration_number": string,
            "mail": string,
            "id_manager": number,
            "organisation_id": number,
            "role_id": number
        }
    ]
```

### GET /users/:search_terms

Response:

```json
    [
        {
            "id": number,
            "firstname": string,
            "lastname": string
        }
    ]
```

### DELETE /users/:id

Response:

```json
    status: 204
```

### GET /skills

Response:

```json

```

## Comment routes:

### GET /comments/:id_idea/:field

Response:

```json
    {
        "id": number,
        "comment": string,
        "date": timestamp,
        "field": number,
        "user_id": number,
        "idea_id": number
    }
```

### POST /comments

Response:

```json
    {
        "id": number,
        "comment": string,
        "date": timestamp,
        "field": number
    }
```

### DELETE /comments/:id_comment

Response:

```json
    status: 204
```

## Categories routes:

### GET /categories

Response:

```json
    {
        "id": number,
        "name": string,
        "id_parent_categorie": number
    }
```

### POST /categories

Response:

```json
    status 201
```

### PUT /categories/:id

Response:

```json
    {
        "id": number,
        "name": string,
        "id_parent_categorie": number
    }
```

### DELETE /categories/:id

Response:

```json
    status 204
```

## Organisation routes:

### GET /organisations

Response:

```json
    {
        "id": number,
        "name": string
    }
```

### POST /organisations

Response:

```json
    status 201
```

### PUT /organisations/:id

Response:

```json
    status 204
```

### DELETE /organisations/:id

Response:

```json
    status 204
```

## Ideas routes:

### GET /ideas/

Body:

```json
{
    "user_id": [number],
    "created_date": {
        "from": string,
        "to": string
    },
    "finished_date": {
        "from": string,
        "to": string
    },
    "manager_validation_date": {
        "from": string,
        "to": string
    },
    "ambassador_validation_date": {
        "from": string,
        "to": string
    },
    "categories": [number],
    "organisations": [number],
    "status": number,
    "order": [
        {
            "column": number,
            "order": string (ASC/DESC)
        }
    ]
}
```

Ordering column:

```
   0 created_date
   1 finished_date
   2 organisation
   3 user
   4 status
   5 manager_validation_date
   6 ambassador_validation_date
```

Response:

```json
    {
        ideas: [
            {
                "id": number,
                "name": string,
                "description": string,
                "problem": string,
                "solution": string,
                "note": number,
                "views": number,
                "status": number,
                "crated_date": timestamp,
                "finished_date": timestamp,
                "manager_validation_date": timestamp,
                "ambassador_validation_date": timestamp
            }
        ],
        coauthors: [
            {
                "coauthor_id": number,
                "idea_id": number
            }
        ],
        users: [
            {
                "id": number,
                "firstname": string,
                "lastname": string
            }
        ]
    }
```

### GET /ideas/:id

Response:

```json
    {
        ideas: [
            {
                "id": number,
                "name": string,
                "description": string,
                "problem": string,
                "solution": string,
                "note": number,
                "views": number,
                "status": number,
                "crated_date": timestamp,
                "finished_date": timestamp,
                "manager_validation_date": timestamp,
                "ambassador_validation_date": timestamp
            }
        ],
        coauthors: [
            {
                "coauthor_id": number
            }
        ],
        users: [
            {
                "id": number,
                "firstname": string,
                "lastname": string
            }
        ],
        comments: [
            n = [ /* n = field, 2 comments/field only */
                {
                    "id": number,
                    "comment": number,
                    "date": number,
                    "user_id": number
                }
            ]
        ]
    }
```

### POST /ideas

Body:

```json
    {
        "name": string,
        "description": string,
        "problem": string,
        "solution": string,
        "finished_date": boolean
    }
```

Response:

```json
    status 201 + location(/ideas/id)
```

### PUT /ideas/:id

Body:

```json
    {
        "name": string,
        "description": string,
        "problem": string,
        "solution": string,
        "finished_date": boolean
    }
```

Response:

```json
    code 204
```

### DELETE /ideas/:id

Response:

```json
    code 204
```

## Assets routes:

### GET /assets/:id_idea

Response:

```json
    [
        {

        }
        ...
    ]
```

### POST /assets/:id_idea

Response:

```json
    [
        {

        }
        ...
    ]
```

### PUT /assets/:id_idea

Response:

```json
    [
        {

        }
        ...
    ]
```

### DELETE /assets/:id_asset

Response:

```json
    [
        {

        }
        ...
    ]
```

## Roles routes:

### GET /roles

Response:

```json
    {
        "id": number,
        "name": string
    }
```

### POST /roles

Response:

```json
    status 201
```

### PUT /roles/:id

Response:

```json
    status 204
```

### DELETE /roles/:id

Response:

```json
    status 204
```
