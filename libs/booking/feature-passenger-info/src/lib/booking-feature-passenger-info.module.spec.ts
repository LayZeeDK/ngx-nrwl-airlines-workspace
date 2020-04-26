import { TestBed } from '@angular/core/testing';

import { BookingFeaturePassengerInfoModule } from './booking-feature-passenger-info.module';

describe('BookingFeaturePassengerInfoModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [BookingFeaturePassengerInfoModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(BookingFeaturePassengerInfoModule).toBeDefined();
  });
});
