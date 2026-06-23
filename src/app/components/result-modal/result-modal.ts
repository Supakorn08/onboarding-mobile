import { Component, computed, input, output } from '@angular/core';
import { ModalComponent, ModalButton, IconComponent } from '@exim/ui-kit';

@Component({
  selector: 'app-result-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent],
  templateUrl: './result-modal.html',
  styleUrl: './result-modal.scss',
})
export class ResultModal {
  open = input<boolean>(false);
  variant = input<'not-found' | 'not-linked' | 'otp-exceeded'>('not-found');
  heading = input<string>('');
  body = input<string>('');
  buttonText = input<string>('ตกลง');

  confirm = output<void>();
  closed = output<void>();

  protected readonly iconName = computed(() => {
    switch (this.variant()) {
      case 'not-linked': return 'profile setting';
      case 'otp-exceeded': return 'danger circle';
      default: return 'cross circle';
    }
  });

  protected readonly rightBtn = computed<ModalButton>(() => ({
    label: this.buttonText(),
    variant: 'primary',
    action: () => this.confirm.emit(),
  }));
}
