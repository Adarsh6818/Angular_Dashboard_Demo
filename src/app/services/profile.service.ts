import { computed, Injectable, signal } from '@angular/core';
import { api } from '../core/api';
import { ContactType, Profile, ProfileDetailsInput } from '../models/profile.models';
import { computeInitials } from './profile.logic';

const EMPTY_PROFILE: Profile = {
  fullName: '',
  addressLine1: '',
  city: '',
  country: '',
  contacts: [],
};

/** Guard against a malformed response (e.g. an HTML fallback) being stored as the profile. */
function isProfile(data: unknown): data is Profile {
  return (
    !!data &&
    typeof data === 'object' &&
    typeof (data as Profile).fullName === 'string' &&
    Array.isArray((data as Profile).contacts)
  );
}

// Profile state: fetches the profile from the REST API via Axios and exposes CRUD operations.
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly profileState = signal<Profile>(EMPTY_PROFILE);

  /** True once the first load has finished. */
  readonly ready = signal(false);
  readonly error = signal<string | null>(null);

  readonly profile = this.profileState.asReadonly();
  readonly contacts = computed(() => this.profileState().contacts);
  readonly initials = computed(() => computeInitials(this.profileState().fullName));

  /** READ: load the profile from the API. */
  async load(): Promise<void> {
    try {
      const { data } = await api.get<Profile>('/profile');
      this.profileState.set(isProfile(data) ? data : EMPTY_PROFILE);
      this.error.set(null);
    } catch {
      this.error.set('Could not load profile. Is the API server running?');
    } finally {
      this.ready.set(true);
    }
  }

  /** UPDATE: replace the core profile details (name + address). */
  async updateDetails(input: ProfileDetailsInput): Promise<void> {
    const { data } = await api.put<Profile>('/profile/details', input);
    this.profileState.set(data);
  }

  /** CREATE: add a new contact entry. */
  async addContact(type: ContactType, value: string): Promise<void> {
    const { data } = await api.post<Profile>('/profile/contacts', { type, value });
    this.profileState.set(data);
  }

  /** UPDATE: edit an existing contact entry. */
  async updateContact(id: string, type: ContactType, value: string): Promise<void> {
    const { data } = await api.put<Profile>(`/profile/contacts/${id}`, { type, value });
    this.profileState.set(data);
  }

  /** DELETE: remove a contact entry. */
  async removeContact(id: string): Promise<void> {
    const { data } = await api.delete<Profile>(`/profile/contacts/${id}`);
    this.profileState.set(data);
  }
}
