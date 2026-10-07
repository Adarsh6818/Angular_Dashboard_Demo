import { computeInitials } from './profile.logic';

describe('computeInitials', () => {
  it('returns first + last initial for a full name', () => {
    expect(computeInitials('Alex Morgan')).toBe('AM');
  });

  it('uppercases the initials', () => {
    expect(computeInitials('jordan lee')).toBe('JL');
  });

  it('handles a single name', () => {
    expect(computeInitials('Cher')).toBe('CC');
  });

  it('returns an empty string for a blank name', () => {
    expect(computeInitials('   ')).toBe('');
  });
});
