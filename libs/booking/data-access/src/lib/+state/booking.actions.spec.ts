import * as fromBooking from './booking.actions';

describe('loadBookings', () => {
  it('should return an action', () => {
    expect(fromBooking.loadBookings().type).toBe('[Booking] Load Bookings');
  });
});
