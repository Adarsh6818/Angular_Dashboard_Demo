import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileService);
  });

  it('derives initials from the full name', () => {
    expect(service.initials()).toBe('AM'); // Alex Morgan
  });

  it('updates the core profile details', () => {
    service.updateDetails({
      fullName: 'Jordan Lee',
      addressLine1: '1 Main St',
      city: 'Cork',
      country: 'Ireland',
    });
    expect(service.profile().fullName).toBe('Jordan Lee');
    expect(service.profile().city).toBe('Cork');
    expect(service.initials()).toBe('JL');
  });

  it('adds, updates and removes contacts (CRUD)', () => {
    const before = service.contacts().length;

    service.addContact('Phone', '+353 1 234 5678');
    expect(service.contacts().length).toBe(before + 1);

    const added = service.contacts().at(-1)!;
    service.updateContact(added.id, 'Other', 'skype: jlee');
    const updated = service.contacts().find((c) => c.id === added.id);
    expect(updated?.type).toBe('Other');
    expect(updated?.value).toBe('skype: jlee');

    service.removeContact(added.id);
    expect(service.contacts().some((c) => c.id === added.id)).toBe(false);
    expect(service.contacts().length).toBe(before);
  });
});
