import { TestBed } from '@angular/core/testing';

import { SeatmapFeatureSeatListingModule } from './seatmap-feature-seat-listing.module';

describe('SeatmapFeatureSeatListingModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SeatmapFeatureSeatListingModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(SeatmapFeatureSeatListingModule).toBeDefined();
  });
});
