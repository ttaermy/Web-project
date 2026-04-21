import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  template: `<div class="skeleton" [style.width]="width" [style.height]="height" [style.border-radius]="borderRadius"></div>`,
  styles: [`
    .skeleton {
      display: block;
      background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width        = '100%';
  @Input() height       = '16px';
  @Input() borderRadius = '4px';
}
