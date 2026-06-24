import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Terms } from './terms';

describe('Terms', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terms],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Terms);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
