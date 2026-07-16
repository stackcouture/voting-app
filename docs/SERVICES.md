##  Services

### Overview

The Cloud-Native Voting Application consists of five core components that work together to provide an asynchronous, event-driven voting system. Each service has a well-defined responsibility and communicates through standard interfaces, allowing the application to be developed, deployed, and scaled independently.

---
## Service Architecture

```text
                 User
                  │
                  ▼
         Vote Service (Python)
                  │
                  ▼
             Redis Queue
                  │
                  ▼
        Worker Service (.NET)
                  │
                  ▼
    Cloud SQL for PostgreSQL
                  ▲
                  │
        Result Service (Node.js)
                  │
                  ▼
                 User
```

---
## Services

### Vote Service

**Technology:** Python (Flask)

#### Responsibility

The Vote Service provides the web interface where users cast their votes. It validates incoming requests and publishes vote messages to Redis instead of writing directly to the database.

#### Responsibilities

* Presents the voting interface
* Accepts user votes
* Validates incoming requests
* Publishes vote events to Redis
* Returns an immediate response to the user

#### Communication

| Source       | Destination  | Protocol       |
| ------------ | ------------ | -------------- |
| Browser      | Vote Service | HTTP           |
| Vote Service | Redis        | Redis Protocol |

---
### Worker Service

**Technology:** .NET

#### Responsibility

The Worker Service performs asynchronous background processing. It continuously consumes vote messages from Redis and persists processed results into Cloud SQL for PostgreSQL.

#### Responsibilities

* Consumes vote events from Redis
* Processes vote messages
* Writes processed results to PostgreSQL
* Decouples frontend requests from database operations

#### Communication

| Source | Destination | Protocol       |
| ------ | ----------- | -------------- |
| Redis  | Worker      | Redis Protocol |
| Worker | Cloud SQL   | PostgreSQL     |

---
### Result Service

**Technology:** Node.js (Express)

#### Responsibility

The Result Service retrieves processed voting results from Cloud SQL and displays the latest vote counts through a web interface.

#### Responsibilities

* Queries vote results from PostgreSQL
* Displays real-time voting results
* Provides a read-only interface for users

#### Communication

| Source         | Destination    | Protocol   |
| -------------- | -------------- | ---------- |
| Browser        | Result Service | HTTP       |
| Result Service | Cloud SQL      | PostgreSQL |

---
### Redis

**Technology:** Redis

#### Responsibility

Redis functions as an in-memory message broker between the Vote Service and the Worker Service.

#### Responsibilities

* Queues incoming vote events
* Buffers requests during traffic spikes
* Enables asynchronous processing
* Reduces coupling between services

#### Benefits

* Fast in-memory operations
* Improved application responsiveness
* Independent scaling of producers and consumers

---
### Cloud SQL for PostgreSQL

**Technology:** PostgreSQL

#### Responsibility

Cloud SQL provides persistent relational storage for processed voting data.

#### Responsibilities

* Stores processed votes
* Maintains vote consistency
* Supports result queries
* Provides durable application storage

#### Benefits

* Managed PostgreSQL service
* Persistent storage
* Reliable transactional database
* Simplified database operations

---
## Service Communication Flow

```text
1. User submits a vote
        │
        ▼
2. Vote Service validates the request
        │
        ▼
3. Vote message is published to Redis
        │
        ▼
4. Worker Service consumes the message
        │
        ▼
5. Vote is written to Cloud SQL
        │
        ▼
6. Result Service queries the latest data
        │
        ▼
7. User views updated results
```

---
## Design Characteristics

| Characteristic        | Description                                               |
| --------------------- | --------------------------------------------------------- |
| Polyglot Architecture | Services are implemented using Python, Node.js, and .NET. |
| Event-Driven          | Services communicate asynchronously through Redis.        |
| Loose Coupling        | Producers and consumers are independent.                  |
| Stateless Frontends   | Vote and Result services are horizontally scalable.       |
| Background Processing | Worker handles asynchronous database operations.          |
| Persistent Storage    | PostgreSQL stores processed application data.             |

---
## Service Summary

| Component      | Technology        | Primary Role                            |
| -------------- | ----------------- | --------------------------------------- |
| Vote Service   | Python (Flask)    | Accepts user votes and publishes events |
| Worker Service | .NET              | Processes vote events asynchronously    |
| Result Service | Node.js (Express) | Displays processed voting results       |
| Redis          | Redis             | Message broker between services         |
| Cloud SQL      | PostgreSQL        | Persistent relational database          |

---