import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatListingComponent } from './seat-listing.component';

describe('SeatListingComponent', () => {
  let component: SeatListingComponent;
  let fixture: ComponentFixture<SeatListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeatListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeatListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
