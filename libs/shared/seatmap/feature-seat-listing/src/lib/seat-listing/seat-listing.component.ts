import { Component } from '@angular/core';
import { formatDate } from '@nrwl-airlines/shared/util-formatting';
import { DateTime } from 'luxon';

@Component({
  selector: 'seatmap-seat-listing',
  styleUrls: ['./seat-listing.component.css'],
  templateUrl: './seat-listing.component.html',
})
export class SeatListingComponent {
  get today(): string {
    const now = DateTime.local();

    return formatDate(now);
  }

  onSeatConfirmed(isConfirmed: boolean): void {
    console.log('Is seat confirmed?', isConfirmed);
  }
}
