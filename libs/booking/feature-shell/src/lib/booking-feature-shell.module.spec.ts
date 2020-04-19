import { TestBed } from '@angular/core/testing';

import { BookingFeatureShellModule } from './booking-feature-shell.module';

describe('BookingFeatureShellModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [BookingFeatureShellModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(BookingFeatureShellModule).toBeDefined();
  });
});
