import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@exim/ui-kit';
import { LANDING_MESSAGES } from './landing.message';
import { LANDING_SELECTORS } from './landing.selector';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  protected readonly msg = LANDING_MESSAGES;
  protected readonly sel = LANDING_SELECTORS;

  private readonly router = inject(Router);

  proceed(): void {
    this.router.navigate(['/register']);
  }
}
