import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-mock-trigger-hint',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mock-trigger-hint.html',
  styleUrl: './mock-trigger-hint.scss',
})
export class MockTriggerHint {
  protected readonly useMock = environment.useMock;
  protected readonly expanded = signal(false);

  protected toggle(): void {
    this.expanded.update((v) => !v);
  }
}
