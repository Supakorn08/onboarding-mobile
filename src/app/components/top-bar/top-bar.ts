import { Component, input, output } from '@angular/core';
import { IconButtonComponent } from '@exim/ui-kit';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [IconButtonComponent],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  title = input<string>('');
  showBack = input<boolean>(true);
  back = output<void>();
}
