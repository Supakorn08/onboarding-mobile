import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, InputFieldComponent } from '@exim/ui-kit';
import { TopBar } from '../../components/top-bar/top-bar';
import { ResultModal } from '../../components/result-modal/result-modal';
import { RegisterState } from './register.state';
import { REGISTER_MESSAGES } from './register.message';
import { REGISTER_SELECTORS } from './register.selector';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ButtonComponent, InputFieldComponent, TopBar, ResultModal],
  providers: [RegisterState],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  protected readonly msg = REGISTER_MESSAGES;
  protected readonly sel = REGISTER_SELECTORS;
  protected readonly state = inject(RegisterState);
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/']);
  }
}
