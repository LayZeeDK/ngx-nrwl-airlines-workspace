import { TestBed } from '@angular/core/testing';

import { SeatmapDataAccessModule } from './seatmap-data-access.module';

describe('SeatmapDataAccessModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SeatmapDataAccessModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(SeatmapDataAccessModule).toBeDefined();
  });
});
