import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Otp } from './otp';

describe('Otp', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Otp],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Otp);
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });
});
