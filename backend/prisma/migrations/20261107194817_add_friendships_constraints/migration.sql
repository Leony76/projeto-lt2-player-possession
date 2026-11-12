-- This is an empty migration.
ALTER TABLE contacts
ADD CONSTRAINT contacts_different_users
CHECK (requester_id <> addressee_id);

CREATE UNIQUE INDEX contacts_unique_pair ON contacts (
  LEAST(requester_id, addressee_id),
  GREATEST(requester_id, addressee_id)
);