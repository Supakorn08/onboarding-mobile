import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environments';

const STORAGE_KEY = 'onboarding.useMock';

function loadInitial(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch {
    /* localStorage unavailable (e.g. SSR / private mode) */
  }
  return environment.useMock;
}

/**
 * Runtime data-source mode: mock vs real API. Defaults to `environment.useMock`,
 * but can be toggled at runtime from the dev panel and is remembered across
 * reloads via localStorage. `SubscriptionService` reads `useMock()` to branch.
 */
@Injectable({ providedIn: 'root' })
export class AppModeState {
  private readonly _useMock = signal<boolean>(loadInitial());
  readonly useMock = this._useMock.asReadonly();

  toggle(): void {
    this.setMock(!this._useMock());
  }

  setMock(value: boolean): void {
    this._useMock.set(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* localStorage unavailable */
    }
  }
}
