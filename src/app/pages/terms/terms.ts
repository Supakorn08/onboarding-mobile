import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@exim/ui-kit';
import { TopBar } from '../../components/top-bar/top-bar';
import { TermsState } from './terms.state';
import { TERMS_MESSAGES } from './terms.message';
import { TERMS_SELECTORS } from './terms.selector';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [ButtonComponent, TopBar],
  providers: [TermsState],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export class Terms implements AfterViewInit {
  protected readonly msg = TERMS_MESSAGES;
  protected readonly sel = TERMS_SELECTORS;
  protected readonly state = inject(TermsState);
  private readonly scrollEl = viewChild<ElementRef<HTMLElement>>('scrollEl');
  private readonly router = inject(Router);

  ngAfterViewInit(): void {
    // If the content is short enough that it cannot scroll, the (scroll) event
    // never fires — unlock the accept button immediately so the flow isn't stuck.
    const el = this.scrollEl()?.nativeElement;
    if (el && el.scrollHeight - el.clientHeight < 8) {
      this.state.markScrolledToBottom();
    }
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 8) {
      this.state.markScrolledToBottom();
    }
  }

  goBack(): void {
    this.router.navigate(['/otp']);
  }
}
