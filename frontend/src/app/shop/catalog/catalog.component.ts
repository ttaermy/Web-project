import { Component, OnInit, AfterViewInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideSparkles, LucideBot, LucideSearch, LucideCamera, LucideMic } from '@lucide/angular';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { AiSearchService } from '../../core/services/ai-search.service';
import { VoiceSearchService } from '../../core/services/voice-search.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { Product, Category } from '../../shared/interfaces/product.interface';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { ProductCardSkeletonComponent } from '../../shared/components/product-card-skeleton/product-card-skeleton.component';
import introJs from 'intro.js';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideSparkles, LucideBot, LucideSearch, LucideCamera, LucideMic, StarRatingComponent, ProductCardSkeletonComponent],
  template: `
    <div class="catalog">

      <!-- AI Search -->
      <div class="ai-search-block">
        <div class="ai-label">
          <svg lucideSparkles [size]="16"></svg>
          <span>AI-поиск</span>
        </div>
        <div class="ai-input-row">
          <input
            type="text"
            class="ai-input"
            placeholder="Опишите что ищете: 'что-то для офиса недорогое'..."
            [(ngModel)]="aiQuery"
            (keydown.enter)="aiSearch()"
          />
          <button class="btn btn-primary" (click)="aiSearch()" [disabled]="aiLoading() || !aiQuery.trim()">
            {{ aiLoading() ? 'Ищу...' : 'Найти' }}
          </button>
          <button class="btn btn-ghost img-search-btn" (click)="imageFileInput.click()" [disabled]="aiLoading()" title="Поиск по изображению">
            <svg lucideCamera [size]="18"></svg>
          </button>
          <input
            #imageFileInput
            type="file"
            accept="image/*"
            style="display:none"
            (change)="onImageSelect($event)"
          />
          @if (voiceSupported) {
            <button
              class="btn btn-ghost mic-btn"
              [class.listening]="voiceSearchService.isListening()"
              (click)="startVoiceSearch()"
              [disabled]="aiLoading()"
              title="Голосовой поиск"
            >
              <svg lucideMic [size]="18"></svg>
            </button>
          }
          @if (imagePreview) {
            <img [src]="imagePreview" class="img-thumb" alt="preview" />
          }
          @if (aiResult()) {
            <button class="btn btn-ghost" (click)="clearAi()">Сбросить</button>
          }
        </div>
        @if (voiceError) {
          <div class="ai-error">{{ voiceError }}</div>
        }
        @if (aiResult()) {
          <div class="ai-message">
            <svg lucideBot [size]="16"></svg>
            {{ aiResult()!.message }}
          </div>
        }
        @if (aiError()) {
          <div class="ai-error">{{ aiError() }}</div>
        }
      </div>

      <!-- Filters -->
      <div class="catalog-toolbar">
        <div class="toolbar-left">
          <input
            type="text"
            placeholder="Поиск..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event); loadProducts()"
            style="max-width: 220px"
          />
          <select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event); loadProducts()" style="max-width: 180px">
            <option value="">Все категории</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>
        <p class="results-count">{{ displayProducts().length }} товаров</p>
      </div>

      <!-- Extra filters row -->
      <div class="extra-filters">
        <input
          type="number"
          placeholder="Цена от"
          [ngModel]="minPrice()"
          (ngModelChange)="minPrice.set($event); loadProducts()"
          style="max-width: 120px"
          min="0"
        />
        <input
          type="number"
          placeholder="Цена до"
          [ngModel]="maxPrice()"
          (ngModelChange)="maxPrice.set($event); loadProducts()"
          style="max-width: 120px"
          min="0"
        />
        <label class="checkbox-label">
          <input
            type="checkbox"
            style="width:auto"
            [ngModel]="inStock()"
            (ngModelChange)="inStock.set($event); loadProducts()"
          />
          Только в наличии
        </label>
        <select [ngModel]="ordering()" (ngModelChange)="onOrderingChange($event)" style="max-width: 160px">
          <option value="">По умолчанию</option>
          <option value="price">Цена ↑</option>
          <option value="-price">Цена ↓</option>
          <option value="-created_at">Новинки</option>
          <option value="-rating">По рейтингу</option>
        </select>
        <button class="btn btn-ghost" (click)="resetFilters()">Сбросить</button>
      </div>

      <!-- Grid -->
      @if (isLoading()) {
        <div class="products-grid">
          @for (s of skeletons; track s) {
            <app-product-card-skeleton></app-product-card-skeleton>
          }
        </div>
      } @else if (displayProducts().length > 0) {
        <div class="products-grid">
          @for (p of displayProducts(); track p.id) {
            <div class="product-card">
              <a [routerLink]="['/shop/product', p.id]" class="product-img-link">
                <div class="product-img">
                  @if (p.stock === 0) {
                    <span class="badge badge-empty">Нет</span>
                  } @else if (p.stock <= 5) {
                    <span class="badge badge-low">Мало</span>
                  }
                  @if (p.image_url) {
                    <img [src]="p.image_url" [alt]="p.name" class="product-img-photo" />
                  } @else {
                    <div class="product-img-fallback">{{ p.name.charAt(0) }}</div>
                  }
                </div>
              </a>
              <div class="product-body">
                <p class="product-price">{{ formatPrice(p.price) }}</p>
                <a [routerLink]="['/shop/product', p.id]" class="product-name-link">
                  <h3 class="product-name">{{ p.name }}</h3>
                </a>
                <app-star-rating
                  [rating]="p.average_rating || 0"
                  [count]="p.rating_count || 0"
                  [interactive]="true"
                  [productId]="p.id"
                ></app-star-rating>
                @if (p.description) {
                  <p class="product-desc">{{ p.description }}</p>
                }
                @if (p.stock > 0) {
                  <button
                    class="btn-buy"
                    [class.added]="isAdded(p.id)"
                    (click)="handleCartBtn(p)"
                  >
                    {{ isAdded(p.id) ? '✓ В корзине' : 'Купить' }}
                  </button>
                } @else {
                  <button class="btn-buy btn-buy-disabled" disabled>
                    Нет в наличии
                  </button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <svg lucideSearch [size]="48" style="opacity:.3"></svg>
          <p>Товары не найдены</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .catalog { display: flex; flex-direction: column; gap: 20px; }

    /* ── AI Search ── */
    .ai-search-block {
      background: linear-gradient(135deg, var(--primary-light) 0%, #F0F9FF 100%);
      border: 1px solid #BFDBFE;
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ai-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; color: var(--primary);
    }
    .ai-input-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .ai-input { flex: 1; background: var(--surface); border-color: #BFDBFE; }
    .ai-input:focus { border-color: var(--primary); }
    .img-search-btn { padding: 8px 10px; }
    .img-thumb {
      width: 40px; height: 40px;
      border-radius: 8px; object-fit: cover;
      border: 1px solid var(--border); flex-shrink: 0;
    }
    .mic-btn { padding: 8px 10px; }
    .mic-btn.listening {
      color: var(--danger);
      border-color: var(--danger);
      animation: pulse 1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%       { transform: scale(1.15); opacity: .7; }
    }
    .ai-message {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #1E40AF;
      background: rgba(255,255,255,.7); border-radius: 8px; padding: 10px 14px;
    }
    .ai-error {
      font-size: 13px; color: var(--danger);
      background: #FEF2F2; border-radius: 8px; padding: 10px 14px;
    }

    /* ── Toolbar ── */
    .catalog-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .toolbar-left    { display: flex; gap: 10px; align-items: center; }
    .results-count   { font-size: 13px; color: var(--text-muted); }

    /* ── Extra Filters ── */
    .extra-filters { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .checkbox-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--text-muted); cursor: pointer;
    }

    /* ── Grid ── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      transition: box-shadow .2s, transform .2s;
      display: flex;
      flex-direction: column;
    }
    .product-card:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,.1);
      transform: translateY(-2px);
    }

    .product-img-link { display: block; text-decoration: none; }

    .product-img {
      position: relative; aspect-ratio: 1 / 1;
      background: #F7F7F7; overflow: hidden;
    }
    .product-img-photo   { width: 100%; height: 100%; object-fit: cover; display: block; }
    .product-img-fallback {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 56px; font-weight: 700; color: var(--primary); opacity: .15;
    }

    .badge {
      position: absolute; top: 8px; left: 8px; z-index: 1;
      font-size: 10px; font-weight: 700; padding: 3px 7px;
      border-radius: 4px; text-transform: uppercase; letter-spacing: .04em;
    }
    .badge-low   { background: #FEF9C3; color: #854D0E; }
    .badge-empty { background: #FEE2E2; color: #991B1B; }

    .product-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .product-price { font-size: 15px; font-weight: 700; color: var(--text); }
    .product-name-link { text-decoration: none; color: inherit; }
    .product-name  { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
    .product-desc  {
      font-size: 12px; color: var(--text-muted); flex: 1;
      overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4;
    }

    .btn-buy {
      margin-top: 10px; width: 100%; padding: 9px 0;
      border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); color: var(--text);
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: background .15s, border-color .15s, color .15s;
    }
    .btn-buy:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    .btn-buy.added { background: var(--primary); border-color: var(--primary); color: #fff; }
    .btn-buy-disabled { opacity: .4; cursor: not-allowed; }
    .btn-buy-disabled:hover { border-color: var(--border); color: var(--text); background: var(--surface); }

    .empty-state { text-align: center; padding: 80px 20px; color: var(--text-muted); }
    .empty-state p { font-size: 16px; margin-top: 12px; }
  `]
})
export class CatalogComponent implements OnInit, AfterViewInit, OnDestroy {
  private products  = signal<Product[]>([]);
  categories        = signal<Category[]>([]);
  searchQuery       = signal('');
  selectedCategory  = signal('');
  minPrice          = signal<number | null>(null);
  maxPrice          = signal<number | null>(null);
  inStock           = signal(false);
  ordering          = signal('');
  isLoading         = signal(false);
  aiQuery           = '';
  aiLoading         = signal(false);
  aiError           = signal('');
  aiResult          = signal<{ message: string; products: Product[] } | null>(null);
  imagePreview:     string | null = null;
  voiceSupported    = false;
  voiceError        = '';
  skeletons         = [1, 2, 3, 4, 5, 6, 7, 8];
  private paramsSub?: Subscription;

  displayProducts = computed(() => {
    const base = this.aiResult() ? this.aiResult()!.products : this.products();
    if (this.ordering() === '-rating') {
      return [...base].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }
    return base;
  });

  constructor(
    private productService:     ProductService,
    private cartService:        CartService,
    private aiSearchService:    AiSearchService,
    public  voiceSearchService: VoiceSearchService,
    private onboardingService:  OnboardingService,
    private router:             Router,
    private route:              ActivatedRoute,
  ) {}

  ngOnInit() {
    this.voiceSupported = this.voiceSearchService.isSupported();
    this.loadProducts();
    this.productService.getCategories().subscribe(data => this.categories.set(data));
  }

  ngAfterViewInit() {
    this.paramsSub = this.route.queryParams.subscribe(params => {
      if (params['tour'] === '1' || this.onboardingService.shouldShowTour()) {
        this.onboardingService.markTourDone();
        setTimeout(() => this.runTour(), 700);
      }
    });
  }

  ngOnDestroy() {
    this.paramsSub?.unsubscribe();
  }

  private runTour() {
    const ic = (svg: string, title: string, text: string) =>
      `<div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:var(--primary-light);flex-shrink:0">${svg}</span>
          <strong style="font-size:14px;color:var(--text)">${title}</strong>
        </div>
        <p style="font-size:13px;color:var(--text-muted);margin:0">${text}</p>
      </div>`;

    const allSteps = [
      {
        sel: '.ai-search-block',
        intro: ic(
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>`,
          'AI-поиск',
          'Опишите товар словами или загрузите фото'
        )
      },
      {
        sel: '.mic-btn',
        intro: ic(
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
          'Голосовой поиск',
          'Нажмите и скажите название товара'
        )
      },
      {
        sel: '.catalog-toolbar',
        intro: ic(
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>`,
          'Фильтры',
          'Фильтруйте по цене, категории и наличию'
        )
      },
      {
        sel: '.products-grid',
        intro: ic(
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/><rect x="2" y="14" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/></svg>`,
          'Каталог товаров',
          'Нажмите на карточку товара чтобы узнать подробнее'
        )
      },
      {
        sel: '.cart-btn',
        intro: ic(
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
          'Корзина',
          'Добавляйте понравившиеся товары в корзину'
        )
      },
    ];
    const steps = allSteps
      .map(s => ({ element: document.querySelector(s.sel) as HTMLElement, intro: s.intro }))
      .filter(s => !!s.element);

    if (steps.length === 0) return;

    introJs().setOptions({
      steps,
      showProgress: true,
      showBullets: false,
      nextLabel: 'Далее',
      prevLabel: 'Назад',
      skipLabel: 'Пропустить',
      doneLabel: 'Готово',
    }).start();
  }

  loadProducts() {
    const params: any = {};
    const cat = this.selectedCategory();
    const q   = this.searchQuery();
    const min = this.minPrice();
    const max = this.maxPrice();
    const ord = this.ordering();
    if (cat)  params['category']  = +cat;
    if (q)    params['search']    = q;
    if (min != null) params['min_price'] = min;
    if (max != null) params['max_price'] = max;
    if (this.inStock()) params['in_stock'] = true;
    if (ord && ord !== '-rating') params['ordering'] = ord;

    this.isLoading.set(true);
    this.productService.getProducts(params).subscribe(data => {
      this.products.set(data);
      this.isLoading.set(false);
    });
  }

  onOrderingChange(value: string) {
    this.ordering.set(value);
    if (value !== '-rating') {
      this.loadProducts();
    }
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStock.set(false);
    this.ordering.set('');
    this.imagePreview = null;
    this.aiResult.set(null);
    this.aiQuery = '';
    this.aiError.set('');
    this.voiceError = '';
    this.loadProducts();
  }

  aiSearch() {
    if (!this.aiQuery.trim()) return;
    this.aiLoading.set(true);
    this.aiError.set('');
    this.aiResult.set(null);

    this.aiSearchService.search(this.aiQuery).subscribe({
      next: res => { this.aiResult.set(res);  this.aiLoading.set(false); },
      error: ()  => { this.aiError.set('Ошибка AI-поиска. Попробуйте ещё раз.'); this.aiLoading.set(false); }
    });
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.imagePreview = dataUrl;
      const base64 = dataUrl.replace(/^data:image\/[^;]+;base64,/, '');
      this.aiLoading.set(true);
      this.aiError.set('');
      this.aiResult.set(null);

      this.aiSearchService.searchByImage(base64).subscribe({
        next: res => { this.aiResult.set(res); this.aiLoading.set(false); },
        error: ()  => { this.aiError.set('Ошибка поиска по изображению.'); this.aiLoading.set(false); }
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  startVoiceSearch() {
    if (this.voiceSearchService.isListening()) return;
    this.voiceError = '';
    this.voiceSearchService.startListening().subscribe({
      next: transcript => {
        this.aiQuery = transcript;
        this.aiSearch();
      },
      error: () => {
        this.voiceError = 'Не удалось распознать речь';
        setTimeout(() => this.voiceError = '', 3000);
      }
    });
  }

  clearAi() {
    this.aiResult.set(null);
    this.aiQuery = '';
    this.aiError.set('');
    this.imagePreview = null;
  }

  handleCartBtn(product: Product) {
    if (this.isAdded(product.id)) {
      this.router.navigate(['/shop/cart']);
    } else {
      this.cartService.add(product);
    }
  }

  isAdded(productId: number): boolean {
    return this.cartService.cartItems().some(i => i.product.id === productId);
  }

  formatPrice(price: string) {
    return Number(price).toLocaleString('ru-RU') + ' ₸';
  }
}
