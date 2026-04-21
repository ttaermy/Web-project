import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingService } from '../../../core/services/rating.service';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating">
      <div class="stars" [class.interactive]="interactive && !alreadyRated()">
        @for (i of stars; track i) {
          <span
            class="star"
            [class.filled]="i < localRating()"
            [class.hovered]="interactive && !alreadyRated() && hoverRating() > 0 && i < hoverRating()"
            (mouseenter)="onHover(i + 1)"
            (mouseleave)="hoverRating.set(0)"
            (click)="onRate(i + 1)"
          >{{ (i < localRating()) || (interactive && !alreadyRated() && hoverRating() > 0 && i < hoverRating()) ? '★' : '☆' }}</span>
        }
      </div>
      @if (count > 0) {
        <span class="rating-info">{{ rating.toFixed(1) }} ({{ count }})</span>
      }
      @if (thankYou()) {
        <span class="thank-you">Спасибо за оценку!</span>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .stars { display: flex; gap: 1px; }
    .star {
      font-size: 16px;
      color: var(--border);
      cursor: default;
      transition: color .1s;
      line-height: 1;
    }
    .star.filled  { color: #F59E0B; }
    .star.hovered { color: #FBBF24; }
    .stars.interactive .star { cursor: pointer; font-size: 20px; }
    .rating-info  { font-size: 12px; color: var(--text-muted); }
    .thank-you    { font-size: 12px; color: var(--success); font-weight: 500; }
  `]
})
export class StarRatingComponent implements OnInit {
  @Input() rating      = 0;
  @Input() count       = 0;
  @Input() interactive = false;
  @Input() productId?: number;

  stars        = [0, 1, 2, 3, 4];
  hoverRating  = signal(0);
  localRating  = signal(0);
  alreadyRated = signal(false);
  thankYou     = signal(false);

  constructor(private ratingService: RatingService) {}

  ngOnInit() {
    this.localRating.set(Math.round(this.rating || 0));
    if (this.productId) {
      try {
        const rated = JSON.parse(localStorage.getItem('rated_products') || '[]') as number[];
        this.alreadyRated.set(rated.includes(this.productId));
      } catch (_) {}
    }
  }

  onHover(i: number) {
    if (!this.interactive || this.alreadyRated()) return;
    this.hoverRating.set(i);
  }

  onRate(score: number) {
    if (!this.interactive || this.alreadyRated() || !this.productId) return;
    this.ratingService.rateProduct(this.productId, score).subscribe({
      next: product => {
        this.localRating.set(Math.round(product.average_rating || 0));
        this.alreadyRated.set(true);
        this.thankYou.set(true);
        setTimeout(() => this.thankYou.set(false), 2000);
        const rated = JSON.parse(localStorage.getItem('rated_products') || '[]') as number[];
        rated.push(this.productId!);
        localStorage.setItem('rated_products', JSON.stringify(rated));
      }
    });
  }
}
