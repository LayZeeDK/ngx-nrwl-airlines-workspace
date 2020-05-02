import * as fromSeatmap from './seatmap.reducer';
import { selectSeatmapState } from './seatmap.selectors';

describe('Seatmap Selectors', () => {
  it('should select the feature state', () => {
    const result = selectSeatmapState({
      [fromSeatmap.seatmapFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
