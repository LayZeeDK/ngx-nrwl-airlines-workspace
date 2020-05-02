import { TestBed } from '@angular/core/testing';

import { SharedUtilFormattingModule } from './shared-util-formatting.module';

describe('SharedUtilFormattingModule', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SharedUtilFormattingModule],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(SharedUtilFormattingModule).toBeDefined();
  });
});
