import * as fromCheckIn from './check-in.reducer';
import { selectCheckInState } from './check-in.selectors';

describe('CheckIn Selectors', () => {
  it('should select the feature state', () => {
    const result = selectCheckInState({
      [fromCheckIn.checkInFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
