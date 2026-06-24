import { Component, inject, signal } from '@angular/core';
import { AppModeState } from '../../state/app-mode.state';

@Component({
  selector: 'app-mock-trigger-hint',
  standalone: true,
  imports: [],
  templateUrl: './mock-trigger-hint.html',
  styleUrl: './mock-trigger-hint.scss',
})
export class MockTriggerHint {
  private readonly mode = inject(AppModeState);
  protected readonly useMock = this.mode.useMock;
  protected readonly expanded = signal(false);

  protected toggleExpand(): void {
    this.expanded.update((v) => !v);
  }

  protected setMock(value: boolean): void {
    this.mode.setMock(value);
  }
}
