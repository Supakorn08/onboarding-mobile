import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, InputOtpComponent, AlertComponent } from '@exim/ui-kit';
import { TopBar } from '../../components/top-bar/top-bar';
import { ResultModal } from '../../components/result-modal/result-modal';
import { environment } from '../../../environments/environments';
import { OtpState } from './otp.state';
import { OTP_MESSAGES } from './otp.message';
import { OTP_SELECTORS } from './otp.selector';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputOtpComponent, AlertComponent, TopBar, ResultModal],
  providers: [OtpState],
  templateUrl: './otp.html',
  styleUrl: './otp.scss',
})
export class Otp {
  protected readonly msg = OTP_MESSAGES;
  protected readonly sel = OTP_SELECTORS;
  protected readonly state = inject(OtpState);
  protected readonly expiryMinutes = environment.otpConfig.otpExpiryMinutes;
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/register']);
  }
}
