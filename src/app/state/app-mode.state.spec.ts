import { TestBed } from '@angular/core/testing';
import { AppModeState } from './app-mode.state';

describe('AppModeState', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('toggles the mode and persists to localStorage', () => {
    const state = TestBed.inject(AppModeState);
    const initial = state.useMock();

    state.toggle();
    expect(state.useMock()).toBe(!initial);
    expect(localStorage.getItem('onboarding.useMock')).toBe(String(!initial));

    state.setMock(false);
    expect(state.useMock()).toBe(false);
    state.setMock(true);
    expect(state.useMock()).toBe(true);
  });
});
