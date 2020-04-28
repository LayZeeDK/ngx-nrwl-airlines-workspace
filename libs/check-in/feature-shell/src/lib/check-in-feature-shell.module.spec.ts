import { TestBed } from '@angular/core/testing';

import { CheckInFeatureShellModule } from './check-in-feature-shell.module';

describe('CheckInFeatureShellModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CheckInFeatureShellModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(CheckInFeatureShellModule).toBeDefined();
  });
});
