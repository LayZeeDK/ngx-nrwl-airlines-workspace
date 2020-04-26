import { TestBed } from '@angular/core/testing';

import { BookingFeatureFlightSearchModule } from './booking-feature-flight-search.module';

describe('BookingFeatureFlightSearchModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [BookingFeatureFlightSearchModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(BookingFeatureFlightSearchModule).toBeDefined();
  });
});
