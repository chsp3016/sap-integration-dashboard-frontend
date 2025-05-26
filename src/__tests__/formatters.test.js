import { formatters } from '../formatters';

describe('formatters', () => {
  test('formats percentage correctly', () => {
    expect(formatters.percentage(85.5)).toBe('85.5%');
  });
});