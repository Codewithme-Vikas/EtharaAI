import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal';
  @Input() closeOnBackdrop = true;
  @Input() showFooter = true;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  protected onBackdropClick(): void {
    if (!this.closeOnBackdrop) {
      return;
    }

    this.closed.emit();
  }

  protected onClose(): void {
    this.closed.emit();
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }
}
