# Account Self-Service Chatbot Challenge

Build this starter into a credible self-service chatbot for a customer with an overdue account.

We want to see whether you can turn everyday messages into safe, testable actions that persist in a database. The UI can stay simple. We care most about the quality of the decisions behind it.

## The task

Extend the existing Next.js app so the account holder can use chat to:

- read and update their contact details and preferred contact method
- add, update, remove, and view people authorized to act for them
- create and view a one-time promise to pay
- make a mocked payment and view transaction history
- book and view future call appointments

The chatbot should extract the user's intent and details, ask for missing information, reject invalid requests, persist valid changes, and clearly explain the result.

Use the existing UI and starter contracts rather than replacing the project with a new application.

## Start here

1. Click **Use this template** on GitHub and create a private repository.
2. Clone your repository.
3. Install and run the app:

```bash
pnpm i
pnpm dev
```

4. Copy `.env.local.example` to `.env.local` when you are ready to connect Supabase, Resend, and an LLM provider:

```bash
cp .env.local.example .env.local
```

5. Deploy early so you can test the real application as you work. Vercel is recommended, but not required.

Useful checks:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Do not commit API keys or other secrets.

## Engineering bar

Feature coverage alone is not enough. We are looking for evidence that you can make money-adjacent and sensitive-data workflows safe under failure, retries, and ambiguous input.

Your solution should demonstrate these properties:

- **All-or-nothing payments:** recording a mocked payment and reducing the balance must succeed or fail as one operation. The balance and transaction history must not drift apart.
- **Retry safety:** retrying the same payment request must not create a duplicate payment. Explain how you identify repeat requests.
- **Explicit confirmation:** ask the user to confirm before applying a mocked payment.
- **Real follow-up turns:** when information is missing, remember the pending request and use the user's next message to complete it. Explain where that state lives and what happens after a restart or deployment.
- **Controlled side effects:** LLM output is untrusted input. Validate it before calling deterministic business logic, database writes, payments, or notifications.
- **Safe account identity:** this challenge has no authentication, so resolve the single demo account on the server. Do not trust an arbitrary account ID supplied by the browser.
- **Observable failures:** if notification delivery fails after a successful change, keep the change and record enough non-sensitive information for an operator to see and retry the failed notification.
- **Reviewable boundaries:** parsing, validation, business actions, persistence, and notifications should be independently testable. A large route handler that owns all of them will score poorly even if the happy path works.

## Required behaviour

Your solution must handle these workflows end to end.

### Account details

- Read and update the account holder's name, email, phone number, postal address, and preferred contact method.
- Support `email`, `sms`, and `phone` as contact methods.
- Validate input before writing it.

### Related people

- Add, update, remove, and view related people.
- Store their name, email, phone number, and whether they are authorized to act for the account holder.
- Ask a clarifying question when the request is incomplete or identifies more than one person.

### Promise to pay

- Create and view one-time promises to pay.
- Store at least the amount and future due date.
- Do not build recurring payment plans.

### Mocked payment and transactions

- Treat payment details as already on file; do not integrate a real payment provider.
- Ask for confirmation before applying the payment.
- Record the payment transaction and reduce the persisted balance atomically.
- Make payment requests idempotent so a retry cannot create a duplicate charge.
- Show seeded transactions and new mocked payments.
- Reject zero, negative, malformed, and over-balance amounts.

### Call appointments

- Book and view future calls.
- Capture the date, time, phone number, and a short reason where possible.
- Reject dates in the past and ask for missing details.

### Change notifications

After every successful data change:

- send a generic email to the account holder through Resend
- keep sensitive account details out of the email body
- attach an encrypted PDF containing the current account summary, contact details, related people, transactions, promises, appointments, and balance
- use the last four digits of the account holder's current phone number as the PDF password

For local development, you may log a redacted notification when Resend is not configured. The deployed app must be capable of sending the email and encrypted PDF. Automated tests must mock this boundary.

Record each notification attempt and its outcome (`sent`, `failed`, or locally `logged`) without storing sensitive email or PDF content.

## Technical expectations

- Use Supabase for persistent data. Start from the migration and fixture data provided.
- Use an LLM, rules, or a hybrid to turn free text into a structured intent and fields.
- Keep validation and business rules deterministic and testable.
- Do not let an LLM write directly to the database or trigger side effects without validation.
- Handle ambiguous input and missing details without guessing.
- Keep privileged Supabase credentials server-side. If browser access uses a publishable key, enforce appropriate Row Level Security policies.
- Avoid logging account summaries, PDF passwords, or other sensitive data.
- Mock LLM, email, PDF delivery, and payment side effects in automated tests.
- Document important schema or architecture decisions.

You do not need to add authentication, a multi-account admin dashboard, a real payment integration, or a production collections platform.

## Acceptance examples

At minimum, demonstrate that the system can handle:

1. “What phone number is on my account?”
2. “Change my phone number to +353831112233.”
3. “Add Mark Murphy, mark@example.test, +353831998877 so he can act for me.”
4. “Add my brother so he can speak for me.” — ask for the missing details, then complete the same request when the user provides them in a follow-up message.
5. “Can I pay 500 euro on the 1st of next month?”
6. “Pay 150 euro now.” — ask for confirmation, apply it once, and return the updated balance and transaction.
7. Retry the confirmed payment request — do not apply it twice.
8. “Show my transactions.”
9. “Book a call next Tuesday at 10am about my bill.”
10. “Book a call yesterday.” — reject it and ask for a future date.
11. Simulate an LLM, database, or notification failure and return a safe, useful response without corrupting data.

More detail is available in [the acceptance scenarios](./docs/scenarios.md) and [account context](./docs/account-context.md). The skipped examples in `src/lib/chat/chat-contracts.test.ts` may be replaced or extended with your own tests.

## Tests and reviewer experience

The core suite must run without network access, live provider credentials, or a pre-existing `.env.local`. Mock the LLM, Resend, PDF delivery, and persistence boundary where appropriate. A small separate integration suite may use local Supabase, but it must not replace fast offline tests of the business rules.

At minimum, automated tests should cover:

- the required successful workflows
- missing, invalid, and ambiguous input
- multi-turn clarification and completion
- atomic and idempotent mocked payment behaviour
- database failure before and during a change
- notification failure after a successful change
- email redaction and PDF password/encryption behaviour
- invalid or hallucinated LLM output

Do not submit with the starter contract suite still skipped unless equivalent active tests clearly cover every contract and the unused starter file has been removed. From a clean clone, `install`, `lint`, `typecheck`, `test`, and `build` should all pass using the documented commands.

## What to submit

Your private repository must include:

- working source code built on this starter
- clear local setup instructions
- a deployed application linked from your README
- an architecture diagram in the repository root
- automated tests for the core decision and action logic
- a short verification matrix mapping each acceptance example to the relevant implementation and automated test
- a design note of no more than 800 words covering:
  - architecture and data model
  - the most important tradeoffs and assumptions
  - what happens on duplicate requests, partial database failure, invalid LLM output, and notification failure
  - how account identity and sensitive data would be protected with real authentication
  - what you would monitor and improve next

Invite `wardch` as a collaborator when the submission is ready.

## Quality bar

We will score the submission using this rubric:

| Area | Weight | Strong evidence |
| --- | ---: | --- |
| Correctness and persistence | 35% | Workflows operate end to end; payments remain atomic and idempotent after failure, refresh, or retry. |
| Safety and validation | 20% | Identity, invalid input, ambiguous requests, database exposure, and sensitive data are handled deliberately. |
| Code and data design | 20% | Parsing, business logic, persistence, and side effects have clear boundaries and sensible concurrency choices. |
| Tests | 5% | Offline deterministic tests cover core rules, failure paths, retries, and mocked boundaries. |
| Chat workflow design | 10% | Intent extraction is constrained and follow-up turns complete pending work without unsafe guessing. |
| Delivery and explanation | 10% | The deployed app works and the design note clearly explains decisions, limits, and next steps. |

We value a smaller, reliable implementation more than a broad collection of unfinished features.

A submission is not review-ready if it has any of these failures:

- a required workflow is still a stub, `TODO`, or design-only plan
- changed data does not persist
- payment and balance writes can partially succeed or a retried payment can be applied twice
- core decision or action tests require live credentials, network access, or remain skipped
- missing details cannot be completed in a follow-up message
- a real payment provider is used
- sensitive account details appear in email bodies or logs
- a successful data change makes no notification attempt
- the browser can select an arbitrary account while the server uses privileged database access
- the deployed app cannot send a Resend email with an encrypted PDF
- the documented clean-clone checks do not pass
- the starter is discarded in favour of an unrelated rewrite

Before submitting, verify the live app against the acceptance examples and include the exact commands a reviewer should run. We should be able to clone the repository, configure it from the example environment file, run the checks, and understand the design without a call.

## AI tools

You may use Codex, Claude Code, Cursor, or another coding assistant. You remain responsible for every change and should be able to explain the architecture, data model, tradeoffs, tests, and any AI-generated code you accepted or rejected.

## Starter map

- `src/app/api/chat/route.ts`: backend chat route to implement
- `src/lib/chat/`: starter chat contracts and acceptance-test placeholders
- `src/lib/notifications/account-change-notification.ts`: notification boundary to implement
- `supabase/migrations/`: starter database schema and seed data
- `fixtures/`: synthetic account data
- `docs/scenarios.md`: detailed acceptance examples
- `docs/account-context.md`: fixture fields and mutability rules
- `architecture-diagram.md`: starter architecture diagram to replace or extend

## Terms

- **Promise to pay:** an agreement to pay a specific amount on a future date.
- **Related person:** someone the account holder may authorize to speak or act for them.
- **Mocked payment:** a fake payment recorded by this exercise without contacting a payment provider.
- **Persisted data:** database data that remains after refresh.
- **Notification boundary:** the code that sends or logs the account-change email and PDF.
- **Contract test:** a test showing that an important workflow behaves as expected.
