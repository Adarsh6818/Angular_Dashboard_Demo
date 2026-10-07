import { computed, Injectable, signal } from '@angular/core';
import { Contact, ContactType, Profile, ProfileDetailsInput } from '../models/profile.models';

// Holds the investor profile as a signal and exposes CRUD operations over it.
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly profileState = signal<Profile>(SEED_PROFILE);

  /** READ: the current profile (read-only to consumers). */
  readonly profile = this.profileState.asReadonly();

  /** READ: the profile's contact entries. */
  readonly contacts = computed(() => this.profileState().contacts);

  /** Initials derived from the full name, for the avatar. */
  readonly initials = computed(() => {
    const parts = this.profileState().fullName.trim().split(/\s+/);
    return (parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '');
  });

  /** UPDATE: replace the core profile details (name + address). */
  updateDetails(input: ProfileDetailsInput): void {
    this.profileState.update((p) => ({
      ...p,
      fullName: input.fullName.trim(),
      addressLine1: input.addressLine1.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
    }));
  }

  /** CREATE: add a new contact entry. */
  addContact(type: ContactType, value: string): void {
    const contact: Contact = { id: crypto.randomUUID(), type, value: value.trim() };
    this.profileState.update((p) => ({ ...p, contacts: [...p.contacts, contact] }));
  }

  /** UPDATE: edit an existing contact entry. */
  updateContact(id: string, type: ContactType, value: string): void {
    this.profileState.update((p) => ({
      ...p,
      contacts: p.contacts.map((c) => (c.id === id ? { ...c, type, value: value.trim() } : c)),
    }));
  }

  /** DELETE: remove a contact entry. */
  removeContact(id: string): void {
    this.profileState.update((p) => ({
      ...p,
      contacts: p.contacts.filter((c) => c.id !== id),
    }));
  }
}

const SEED_PROFILE: Profile = {
  fullName: 'Alex Morgan',
  addressLine1: '12 Eyre Square',
  city: 'Galway',
  country: 'Ireland',
  contacts: [
    { id: 'c1', type: 'Email', value: 'alex.morgan@example.com' },
    { id: 'c2', type: 'Phone', value: '+353 91 000 000' },
  ],
};
