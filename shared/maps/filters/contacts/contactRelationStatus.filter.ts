export const CONTACTS_RELATION_STATUS_MAP = {
  _                : 'Status',
  CONTACT          : 'Contact',
  REQUEST_SENT     : 'Request sent',
  REQUEST_RECEIVED : 'Request received',
} as const;

export const CONTACTS_RELATION_STATUS_MAP_KEYS = Object.keys(
  CONTACTS_RELATION_STATUS_MAP
).filter(key => key !== '_') as ContactsRelationStatusFilterKeys[];

export type ContactsRelationStatusFilter = keyof typeof CONTACTS_RELATION_STATUS_MAP;
export type ContactsRelationStatusFilterLabel = typeof CONTACTS_RELATION_STATUS_MAP[ContactsRelationStatusFilter];
export type ContactsRelationStatusFilterKeys = Exclude<keyof typeof CONTACTS_RELATION_STATUS_MAP, '_'>;

export type ContactRelationStatus =
| 'CONTACT'
| 'REQUEST_SENT'
| 'REQUEST_RECEIVED'
| 'NOT_CONTACT'
;