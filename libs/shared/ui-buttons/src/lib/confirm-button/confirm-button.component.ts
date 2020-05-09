import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'nrwl-airlines-confirm-button',
  styleUrls: ['./confirm-button.component.css'],
  templateUrl: './confirm-button.component.html',
})
export class ConfirmButtonComponent {
  @Input()
  message = 'Do you confirm this action?';

  @Output()
  confirmed = new EventEmitter<boolean>();

  onClick() {
    this.confirmed.emit(confirm(this.message));
  }
}
