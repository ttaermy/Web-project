import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../shared/interfaces/product.interface';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent, SkeletonComponent, ProductCardSkeletonComponent],
  template: `
    <div class="detail-page">
      <button class="back-btn" (click)="goBack()">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Назад
      </button>

      @if (loading()) {
        <div class="detail-card card">
          <div class="detail-grid">
            <app-skeleton width="100%" height="300px" borderRadius="0"></app-skeleton>
            <div class="detail-info">
              <app-skeleton width="80px" height="20px"></app-skeleton>
              <app-skeleton width="70%" height="32px"></app-skeleton>
              <app-skeleton width="100%" height="14px"></app-skeleton>
              <app-skeleton width="90%" height="14px"></app-skeleton>
              <app-skeleton width="100px" height="40px"></app-skeleton>
              <app-skeleton width="120px" height="28px" borderRadius="6px"></app-skeleton>
              <app-skeleton width="100%" height="48px" borderRadius="8px"></app-skeleton>
            </div>
          </div>
        </div>
      } @else if (product(); as p) {
        <div class="detail-card card">
          <div class="detail-grid">
            <div class="detail-img-wrap">
              @if (p.image_url) {
                <img [src]="p.image_url" [alt]="p.name" class="detail-img" />
              } @else {
                <div class="detail-img-fallback">{{ p.name.charAt(0) }}</div>
              }
            </div>

            <div class="detail-info">
              <span class="category-badge">{{ p.category_name }}</span>
              <h1 class="detail-name">{{ p.name }}</h1>

              <app-star-rating
                [rating]="p.average_rating || 0"
                [count]="p.rating_count || 0"
                [interactive]="true"
                [productId]="p.id"
              ></app-star-rating>

              @if (p.description) {
                <p class="detail-desc">{{ p.description }}</p>
              }

              <p class="detail-price">{{ formatPrice(p.price) }}</p>

              <div class="stock-badge" [class.low]="p.stock <= 5 && p.stock > 0" [class.empty]="p.stock === 0">
                @if (p.stock === 0) {
                  Нет в наличии
                } @else if (p.stock <= 5) {
                  Осталось {{ p.stock }} шт.
                } @else {
                  В наличии: {{ p.stock }} шт.
                }
              </div>

              @if (p.stock > 0) {
                <div class="qty-row">
                  <label class="qty-label">Количество</label>
                  <div class="qty-control">
                    <button (click)="decQty()">−</button>
                    <span class="qty-val">{{ qty }}</span>
                    <button (click)="incQty(p.stock)">+</button>
                  </div>
                </div>

                <button
                  class="add-btn btn btn-primary"
                  [class.added]="isAdded(p.id)"
                  (click)="addToCart(p)"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {{ isAdded(p.id) ? 'Уже в корзине' : 'В корзину' }}
                </button>
              } @else {
                <button class="add-btn btn" disabled>Нет в наличии</button>
              }
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        @if (recsLoading() || recommendations().length > 0) {
          <div class="recs-section">
            <h2 class="recs-title">Похожие товары</h2>
            <div class="recs-scroll">
              @if (recsLoading()) {
                @for (s of [1,2,3,4]; track s) {
                  <div class="rec-skeleton-wrap">
                    <app-product-card-skeleton></app-product-card-skeleton>
                  </div>
                }
              } @else {
                @for (rec of recommendations(); track rec.id) {
                  <div class="rec-card">
                    <a [routerLink]="['/shop/product', rec.id]" class="rec-img-link">
                      <div class="rec-img">
                        @if (rec.image_url) {
                          <img [src]="rec.image_url" [alt]="rec.name" class="rec-img-photo" />
                        } @else {
                          <div class="rec-img-fallback">{{ rec.name.charAt(0) }}</div>
                        }
                      </div>
                    </a>
                    <div class="rec-body">
                      <p class="rec-price">{{ formatPrice(rec.price) }}</p>
                      <a [routerLink]="['/shop/product', rec.id]" class="rec-name-link">
                        <p class="rec-name">{{ rec.name }}</p>
                      </a>
                      @if (rec.stock > 0) {
                        <button class="rec-buy-btn" (click)="cartService.add(rec)">В корзину</button>
                      } @else {
                        <button class="rec-buy-btn" disabled>Нет в наличии</button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }

      } @else if (error()) {
        <div class="error-msg">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: none; border: none; cursor: pointer;
      color: var(--text-muted); font-size: 14px; font-weight: 500;
      padding: 6px 0; transition: color .15s;
    }
    .back-btn:hover { color: var(--primary); }

    .error-msg {
      background: #FEF2F2; color: var(--danger);
      border: 1px solid #FECACA; border-radius: 8px;
      padding: 14px; font-size: 14px;
    }

    .detail-card { padding: 0; overflow: hidden; }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }

    .detail-img-wrap {
      height: 300px;
      background: var(--bg);
      overflow: hidden;
    }

    .detail-img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .detail-img-fallback {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 96px; font-weight: 800;
      color: var(--primary); opacity: .12;
    }

    .detail-info {
      padding: 28px 32px;
      display: flex; flex-direction: column; gap: 14px;
    }

    .category-badge {
      display: inline-block;
      background: var(--primary-light); color: var(--primary);
      font-size: 11px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      padding: 4px 10px; border-radius: 6px;
      width: fit-content;
    }

    .detail-name  { font-size: 26px; font-weight: 800; color: var(--text); line-height: 1.25; }
    .detail-desc  { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
    .detail-price { font-size: 32px; font-weight: 800; color: var(--text); }

    .stock-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 500; color: var(--success);
      background: #F0FDF4; border-radius: 6px; padding: 6px 12px;
      width: fit-content;
    }
    .stock-badge.low   { color: #92400E; background: #FFFBEB; }
    .stock-badge.empty { color: #991B1B; background: #FEF2F2; }

    .qty-row { display: flex; flex-direction: column; gap: 6px; }
    .qty-label { font-size: 13px; font-weight: 500; color: var(--text-muted); }

    .qty-control {
      display: inline-flex; align-items: center;
      border: 1px solid var(--border); border-radius: 8px;
      overflow: hidden; width: fit-content;
    }
    .qty-control button {
      width: 36px; height: 36px;
      border: none; background: var(--bg);
      cursor: pointer; font-size: 18px; font-weight: 600;
      color: var(--text); transition: background .15s;
    }
    .qty-control button:hover { background: var(--border); }
    .qty-val {
      width: 52px; text-align: center;
      font-size: 15px; font-weight: 600;
      border-left: 1px solid var(--border); border-right: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center; height: 36px;
    }

    .add-btn {
      padding: 13px 24px;
      font-size: 15px; font-weight: 600;
      justify-content: center; gap: 10px;
    }
    .add-btn.added { background: var(--success); }
    .add-btn:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Recommendations ── */
    .recs-section { display: flex; flex-direction: column; gap: 14px; }
    .recs-title   { font-size: 18px; font-weight: 700; }

    .recs-scroll {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .rec-skeleton-wrap { min-width: 200px; flex-shrink: 0; }

    .rec-card {
      min-width: 200px; flex-shrink: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .rec-img-link { display: block; text-decoration: none; }
    .rec-img {
      height: 140px;
      background: var(--bg);
      overflow: hidden;
    }
    .rec-img-photo   { width: 100%; height: 100%; object-fit: cover; display: block; }
    .rec-img-fallback {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; font-weight: 700; color: var(--primary); opacity: .15;
    }

    .rec-body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 4px; }
    .rec-price { font-size: 14px; font-weight: 700; }
    .rec-name-link { text-decoration: none; color: inherit; }
    .rec-name { font-size: 13px; font-weight: 500; line-height: 1.3; }

    .rec-buy-btn {
      margin-top: 8px; width: 100%; padding: 7px 0;
      border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); color: var(--text);
      font-size: 12px; font-weight: 600; cursor: pointer;
      transition: background .15s, border-color .15s, color .15s;
    }
    .rec-buy-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    .rec-buy-btn:disabled { opacity: .4; cursor: not-allowed; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product         = signal<Product | null>(null);
  loading         = signal(true);
  error           = signal('');
  qty             = 1;
  recommendations = signal<Product[]>([]);
  recsLoading     = signal(false);

  constructor(
    private route:          ActivatedRoute,
    private productService: ProductService,
    public  cartService:    CartService,
    private location:       Location,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({
      next: p => {
        this.product.set(p);
        this.loading.set(false);
        this.loadRecommendations(p.id);
      },
      error: () => { this.error.set('Товар не найден'); this.loading.set(false); }
    });
  }

  loadRecommendations(productId: number) {
    this.recsLoading.set(true);
    this.productService.getRecommendations(productId).subscribe({
      next: res => {
        this.recommendations.set(res.recommendations.slice(0, 4));
        this.recsLoading.set(false);
      },
      error: () => this.recsLoading.set(false),
    });
  }

  decQty()              { if (this.qty > 1) this.qty--; }
  incQty(stock: number) { if (this.qty < stock) this.qty++; }
  goBack()              { this.location.back(); }

  addToCart(product: Product) {
    for (let i = 0; i < this.qty; i++) {
      this.cartService.add(product);
    }
  }

  isAdded(id: number): boolean {
    return this.cartService.cartItems().some(i => i.product.id === id);
  }

  formatPrice(price: string) { return Number(price).toLocaleString('ru-RU') + ' ₸'; }
}
