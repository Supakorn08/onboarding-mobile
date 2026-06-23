import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Success } from './success';

describe('Success', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Success],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Success);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
