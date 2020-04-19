import { TestBed } from '@angular/core/testing';

import { SharedDataAccessModule } from './shared-data-access.module';

describe('SharedDataAccessModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SharedDataAccessModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(SharedDataAccessModule).toBeDefined();
  });
});
