// Domain models for the investor profile and its contact entries.

export type ContactType = 'Phone' | 'Email' | 'Other';

/** A single contact method belonging to the profile. */
export interface Contact {
  id: string;
  type: ContactType;
  value: string;
}

/** The investor's editable profile details. */
export interface Profile {
  fullName: string;
  addressLine1: string;
  city: string;
  country: string;
  contacts: Contact[];
}

/** The subset of profile fields edited through the "details" form. */
export interface ProfileDetailsInput {
  fullName: string;
  addressLine1: string;
  city: string;
  country: string;
}
