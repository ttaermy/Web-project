import { Component } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="skeleton-card">
      <app-skeleton width="100%" height="160px" borderRadius="0"></app-skeleton>
      <div class="skeleton-body">
        <app-skeleton width="60px" height="12px"></app-skeleton>
        <app-skeleton width="80%" height="16px"></app-skeleton>
        <app-skeleton width="100%" height="12px"></app-skeleton>
        <app-skeleton width="70%" height="12px"></app-skeleton>
        <div class="skeleton-bottom">
          <app-skeleton width="70px" height="18px"></app-skeleton>
          <app-skeleton width="70px" height="32px" borderRadius="8px"></app-skeleton>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .skeleton-body {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .skeleton-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
  `]
})
export class ProductCardSkeletonComponent {}
