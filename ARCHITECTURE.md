# System Architecture & Technical Design Document

**Project**: P2P Student Micro-Lending Network  
**Course**: Software Engineering Lab (`BCSE301P`)  
**Student**: Abhik Sinha (24BCE1315)  
**Interactive Diagram Exporter**: Open [`architecture_diagrams.html`](./architecture_diagrams.html) in your browser to export any diagram as high-res PNG or SVG.

---

## 1. High-Level 3-Tier System Architecture

```mermaid
graph TB
    subgraph ClientTier["1. PRESENTATION TIER (Next.js 14 Client / App Router)"]
        direction TB
        subgraph Users["Actors"]
            Student["Verified Student (@vitstudent.ac.in)"]
            Admin["Campus Administrator"]
        end

        subgraph UIComponents["UI & Pages (React 18 + Tailwind CSS)"]
            HomeFeed["Home Feed & Filters (Academic, Project, Item)"]
            AuthPages["Login / OTP Registration (Domain Guard)"]
            ReqFlow["Request Detail & Offer Submission Modal"]
            ExchView["Exchanges & Item Return Tracker"]
            ProfileKarma["Profile, Trust Score & Karma Ledger"]
            AdminDash["Admin Dashboard (Disputes & Moderation)"]
        end
        Student --> HomeFeed & ReqFlow & ExchView & ProfileKarma & AuthPages
        Admin --> AdminDash
    end

    subgraph AppTier["2. APPLICATION & LOGIC TIER (Next.js 14 Server Engine)"]
        direction TB
        subgraph APIRoutes["Next.js Route Handlers (/api/*)"]
            AuthAPI["/api/auth (Login, Register, OTP Verify)"]
            ReqAPI["/api/requests (Create, Browse, Filter)"]
            OfferAPI["/api/offers (Submit, Accept, Reject)"]
            ExchAPI["/api/exchanges (Complete, Confirm, Dispute)"]
            KarmaAPI["/api/karma (Ledger, Balance Audit)"]
            AdminAPI["/api/admin (Warn, Suspend, Resolve)"]
        end

        subgraph CoreServices["Business Logic & Security Core (src/lib)"]
            AuthService["auth.js<br/>- Domain Guard (@vitstudent.ac.in)<br/>- Bcrypt Hashing<br/>- JWT Token Engine"]
            KarmaEngine["karma.js<br/>- Registration Bonus (+50)<br/>- Min Post Check (&ge; 10)<br/>- Atomic Transfer (-10 / +20)"]
            PrivacyFilter["Privacy & Masking<br/>- Phone/Email masked until match acceptance"]
        end

        UIComponents -->|JSON / HTTPS| APIRoutes
        AuthAPI --> AuthService
        ReqAPI & ExchAPI --> KarmaEngine
        OfferAPI --> PrivacyFilter
    end

    subgraph DataTier["3. DATA & STORAGE TIER"]
        direction TB
        DBRouter["lib/db.js (Smart Connection Pool Router)"]
        
        subgraph PrimaryDB["Primary Database"]
            PostgreSQL[("PostgreSQL / Supabase Cloud<br/>(Connection Pooling via pg)")]
        end

        subgraph FallbackDB["Offline Evaluation Store"]
            JSONDB[("Local Fallback Store<br/>(.db_fallback.json)")]
        end

        CoreServices --> DBRouter
        DBRouter -->|Primary URI Connected| PostgreSQL
        DBRouter -->|Offline / Fallback Mode| JSONDB
    end
```

---

## 2. Exchange Lifecycle & Karma Settlement Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Requester as Requester (Student A)
    participant NextApp as Next.js App / API Layer
    participant KarmaSvc as Karma Engine (lib/karma.js)
    participant DB as PostgreSQL / DB Pool
    actor Helper as Helper / Lender (Student B)

    Note over Requester, Helper: 1. Request Creation
    Requester->>NextApp: POST /api/requests (Academic / Project / Item)
    NextApp->>KarmaSvc: Check Requester Balance >= 10 pts
    KarmaSvc-->>NextApp: Balance verified (Eligible)
    NextApp->>DB: INSERT into requests (status: 'open')

    Note over Requester, Helper: 2. Peer Matching & Privacy Unmasking
    Helper->>NextApp: POST /api/offers (with help message)
    Requester->>NextApp: PATCH /api/offers/accept (Accept Offer)
    NextApp->>DB: UPDATE requests status -> 'in_progress'
    NextApp->>DB: INSERT into exchanges (status: 'active')
    NextApp-->>Requester: Contact Info Unmasked (Student B)
    NextApp-->>Helper: Contact Info Unmasked (Student A)

    Note over Requester, Helper: 3. Exchange Completion & Atomic Settlement
    Requester->>NextApp: POST /api/exchanges/[id]/complete
    NextApp->>KarmaSvc: Execute transferKarma(exchange_id)
    rect rgb(235, 248, 255)
        Note over KarmaSvc, DB: Atomic DB Transaction
        KarmaSvc->>DB: Requester (A): -10 pts (Debit)
        KarmaSvc->>DB: Helper (B): +20 pts (Credit)
        KarmaSvc->>DB: INSERT 2x rows into karma_txns
        KarmaSvc->>DB: UPDATE exchanges status -> 'completed'
    end
    
    Note over Requester, Helper: 4. Peer Trust Feedback
    Requester->>NextApp: POST /api/ratings (1 to 5 Stars + Feedback)
    NextApp->>DB: INSERT into ratings & Recalculate Trust Score
```

---

## 3. Database Entity-Relationship (ER) Model

```mermaid
erDiagram
    USERS ||--o{ REQUESTS : "creates"
    USERS ||--o{ OFFERS : "submits"
    USERS ||--o{ ITEMS : "owns"
    USERS ||--o{ USER_SKILLS : "possesses"
    SKILLS ||--o{ USER_SKILLS : "tagged_in"
    USERS ||--o{ KARMA_TXNS : "logs"
    USERS ||--o{ RATINGS : "rates_or_rated"
    USERS ||--o{ REPORTS : "files_or_reported"
    
    REQUESTS ||--o{ OFFERS : "receives"
    REQUESTS ||--o| EXCHANGES : "originates"
    EXCHANGES ||--o{ KARMA_TXNS : "triggers"
    EXCHANGES ||--o{ RATINGS : "evaluated_in"

    USERS {
        int user_id PK
        string name
        string email UK
        string password_hash
        string role "student | admin"
        int year
        string contact_info
        int karma_balance
        boolean is_verified
        string status "active | warned | suspended"
    }

    REQUESTS {
        int request_id PK
        int requester_id FK
        string category "Academic | Project | Item"
        string title
        text description
        string preferred_mode "in-person | online"
        string campus_location
        date return_date
        string status "open | in_progress | completed | cancelled"
        date created_date
    }

    OFFERS {
        int offer_id PK
        int request_id FK
        int helper_id FK
        text message
        string status "pending | accepted | rejected"
        date offer_date
    }

    EXCHANGES {
        int exchange_id PK
        int request_id FK
        int requester_id FK
        int helper_id FK
        date due_date
        date completion_date
        string status "active | completed | disputed"
    }

    KARMA_TXNS {
        int txn_id PK
        int user_id FK
        int exchange_id FK
        int amount
        string type "signup_bonus | help_provided | request_fulfilled | admin_adjustment"
    }

    RATINGS {
        int rating_id PK
        int exchange_id FK
        int rater_id FK
        int ratee_id FK
        int score "1 to 5"
        text review
    }
```

---

## 4. UML Package Diagram

The UML Package Diagram illustrates the high-level structural organization and decomposition of the P2P Student Micro-Lending Network into cohesive subsystems/packages, depicting their namespace boundaries and inter-package dependencies (`<<use>>`, `<<import>>`, `<<access>>`).

```mermaid
flowchart TB
    %% UML Package Diagram for P2P Student Micro-Lending Network

    subgraph PresentationPkg["«package» Presentation Layer (Frontend / Client)"]
        direction TB
        subgraph ViewsPkg["«package» Pages & Views (src/app)"]
            AuthPages["Auth Views<br/>(/login, /register)"]
            FeedPages["Feed & Discovery Views<br/>(/, /requests)"]
            DetailPages["Request Detail & Modal<br/>(/requests/[id])"]
            ExchangePages["Exchange & Tracking Views<br/>(/exchanges)"]
            ProfilePages["Profile & Karma Views<br/>(/profile)"]
            AdminPages["Admin Moderation Views<br/>(/admin)"]
        end

        subgraph ComponentsPkg["«package» UI Components (src/components)"]
            NavComp["Navbar.jsx<br/>(Role & Session State)"]
            CardComp["RequestCard.jsx<br/>(Badge & Action Triggers)"]
            ModalComp["RatingModal.jsx & ReportModal.jsx<br/>(Dialogs & Forms)"]
            BannerComp["DisclaimerBanner.jsx<br/>(Campus Safety & Rules)"]
        end
        ViewsPkg -.->|«import»| ComponentsPkg
    end

    subgraph ControllerPkg["«package» Controller & API Layer (src/app/api)"]
        direction TB
        AuthAPI["«package» auth_api<br/>(/api/auth/*)"]
        RequestsAPI["«package» requests_api<br/>(/api/requests/*)"]
        OffersAPI["«package» offers_api<br/>(/api/offers/*)"]
        ExchangesAPI["«package» exchanges_api<br/>(/api/exchanges/*)"]
        KarmaAPI["«package» karma_api<br/>(/api/karma/*)"]
        RatingsAPI["«package» ratings_api<br/>(/api/ratings/*)"]
        ReportsAPI["«package» reports_api<br/>(/api/reports/*)"]
        AdminAPI["«package» admin_api<br/>(/api/admin/*)"]
    end

    subgraph DomainServicePkg["«package» Domain & Business Services Layer (src/lib)"]
        direction TB
        AuthSvc["«package» Authentication Service (auth.js)<br/>• Domain Guard (@vitstudent.ac.in)<br/>• Bcrypt Password Hashing<br/>• JWT Token Engine & Verify"]
        KarmaSvc["«package» Karma Engine Service (karma.js)<br/>• Registration Bonus (+50)<br/>• Minimum Posting Check (>=10)<br/>• Atomic Balance Transfer (-10 / +20)"]
        PrivacySvc["«package» Privacy & Masking Policy<br/>• PII Redaction (Phone/Email)<br/>• Mutual Match Unmasking"]
    end

    subgraph DataAccessPkg["«package» Data Access & Persistence Layer (src/lib/db.js)"]
        direction TB
        DBPool["«package» Connection Manager<br/>• Pool Lifecycle (pg.Pool)<br/>• Auto Fallback Detector"]
        QueryRouter["«package» Query Abstraction & DAOs<br/>• User DAO<br/>• Request DAO<br/>• Offer & Exchange DAO<br/>• Karma Ledger DAO<br/>• Rating & Report DAO"]
        DBPool --- QueryRouter
    end

    subgraph DataStoragePkg["«package» Data Storage Subsystem"]
        direction LR
        PostgresDB[("«database» Primary Store<br/>PostgreSQL / Supabase Cloud")]
        FallbackDB[("«file» Offline Store<br/>.db_fallback.json")]
    end

    subgraph ConfigPkg["«package» Configuration & Scripts"]
        EnvConfig["«configuration» Environment (.env.local)"]
        DBScripts["«scripts» Schema & Seed (scripts/*.sql)"]
    end

    %% Dependencies between packages
    PresentationPkg -.->|«use» (REST / HTTP JSON)| ControllerPkg
    ControllerPkg -.->|«use»| DomainServicePkg
    ControllerPkg -.->|«use»| DataAccessPkg
    DomainServicePkg -.->|«use»| DataAccessPkg
    DomainServicePkg -.->|«import»| ConfigPkg
    DataAccessPkg -.->|«access»| DataStoragePkg
    DBScripts -.->|«initializes»| DataStoragePkg
```

