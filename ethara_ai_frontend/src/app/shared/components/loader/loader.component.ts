import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html'
})
export class LoaderComponent {
  @Input() message = 'Loading...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  protected get spinnerClass(): string {
    if (this.size === 'sm') {
      return 'h-4 w-4 border-2';
    }

    if (this.size === 'lg') {
      return 'h-10 w-10 border-4';
    }

    return 'h-6 w-6 border-2';
  }
}
