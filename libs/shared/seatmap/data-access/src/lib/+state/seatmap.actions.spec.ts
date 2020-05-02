import * as fromSeatmap from './seatmap.actions';

describe('loadSeatmaps', () => {
  it('should return an action', () => {
    expect(fromSeatmap.loadSeatmaps().type).toBe('[Seatmap] Load Seatmaps');
  });
});
