import * as fromCheckIn from './check-in.actions';

describe('loadCheckIns', () => {
  it('should return an action', () => {
    expect(fromCheckIn.loadCheckIns().type).toBe('[CheckIn] Load CheckIns');
  });
});
