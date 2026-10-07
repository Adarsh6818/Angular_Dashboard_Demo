import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Contact, ContactType } from '../../models/profile.models';

// Profile view: read/update the investor's name & address and manage (add/edit/delete) contacts.
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);

  protected readonly profile = this.profileService.profile;
  protected readonly contacts = this.profileService.contacts;
  protected readonly ready = this.profileService.ready;
  protected readonly error = this.profileService.error;
  protected readonly contactTypes: ContactType[] = ['Email', 'Phone', 'Other'];

  protected readonly editingDetails = signal(false);
  /** Id of the contact being edited, or null when adding a new one. */
  protected readonly editingContactId = signal<string | null>(null);
  protected readonly showContactForm = signal(false);

  /** Reactive form for the core profile details (name + address). */
  protected readonly detailsForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    addressLine1: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
  });

  /** Reactive form for creating / editing a single contact entry. */
  protected readonly contactForm = this.fb.nonNullable.group({
    type: ['Email' as ContactType, Validators.required],
    value: ['', [Validators.required, Validators.minLength(3)]],
  });

  /** Enter edit mode, pre-filling the details form from the current profile. */
  protected editDetails(): void {
    const p = this.profile();
    this.detailsForm.setValue({
      fullName: p.fullName,
      addressLine1: p.addressLine1,
      city: p.city,
      country: p.country,
    });
    this.editingDetails.set(true);
  }

  protected async saveDetails(): Promise<void> {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    try {
      await this.profileService.updateDetails(this.detailsForm.getRawValue());
      this.editingDetails.set(false);
    } catch {
      this.error.set('Could not save your details. Please try again.');
    }
  }

  protected startAddContact(): void {
    this.editingContactId.set(null);
    this.contactForm.reset({ type: 'Email', value: '' });
    this.showContactForm.set(true);
  }

  protected startEditContact(contact: Contact): void {
    this.editingContactId.set(contact.id);
    this.contactForm.setValue({ type: contact.type, value: contact.value });
    this.showContactForm.set(true);
  }

  protected async saveContact(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    const { type, value } = this.contactForm.getRawValue();
    const id = this.editingContactId();
    try {
      if (id) {
        await this.profileService.updateContact(id, type, value);
      } else {
        await this.profileService.addContact(type, value);
      }
      this.cancelContact();
    } catch {
      this.error.set('Could not save the contact. Please try again.');
    }
  }

  protected cancelContact(): void {
    this.showContactForm.set(false);
    this.editingContactId.set(null);
  }

  protected async deleteContact(id: string): Promise<void> {
    if (confirm('Delete this contact?')) {
      try {
        await this.profileService.removeContact(id);
      } catch {
        this.error.set('Could not delete the contact. Please try again.');
      }
    }
  }

  protected detailsInvalid(control: keyof typeof this.detailsForm.controls): boolean {
    const c = this.detailsForm.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected contactInvalid(control: keyof typeof this.contactForm.controls): boolean {
    const c = this.contactForm.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }
}
