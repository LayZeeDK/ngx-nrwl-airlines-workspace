import * as fromBooking from './booking.reducer';
import { selectBookingState } from './booking.selectors';

describe('Booking Selectors', () => {
  it('should select the feature state', () => {
    const result = selectBookingState({
      [fromBooking.bookingFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
