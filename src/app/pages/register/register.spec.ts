import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Register } from './register';
import { OnboardingFlowState } from '../../state/onboarding-flow.state';

describe('Register', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        OnboardingFlowState,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
