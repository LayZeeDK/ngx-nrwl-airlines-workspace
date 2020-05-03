import { DateTime } from 'luxon';

export function formatDate(luxonDate: DateTime): string {
  return luxonDate.toLocaleString({ ...DateTime.DATE_MED, weekday: 'long' });
}
