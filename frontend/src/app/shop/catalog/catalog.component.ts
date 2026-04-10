import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideSparkles, LucideBot, LucideSearch } from '@lucide/angular';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { AiSearchService } from '../../core/services/ai-search.service';
import { Product, Category } from '../../shared/interfaces/product.interface';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideSparkles, LucideBot, LucideSearch],
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
          <button
            class="btn btn-primary"
            (click)="aiSearch()"
            [disabled]="aiLoading() || !aiQuery.trim()"
          >
            {{ aiLoading() ? 'Ищу...' : 'Найти' }}
          </button>
          @if (aiResult()) {
            <button class="btn btn-ghost" (click)="clearAi()">Сбросить</button>
          }
        </div>
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
            (ngModelChange)="searchQuery.set($event)"
            style="max-width: 220px"
          />
          <select
            [ngModel]="selectedCategory()"
            (ngModelChange)="selectedCategory.set($event)"
            style="max-width: 180px"
          >
            <option value="">Все категории</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>
        <p class="results-count">
          {{ displayProducts().length }} товаров
        </p>
      </div>

      <!-- Grid -->
      @if (displayProducts().length > 0) {
        <div class="products-grid">
          @for (p of displayProducts(); track p.id) {
            <div class="product-card">
              <div class="product-img">
                <span>{{ p.name.charAt(0) }}</span>
              </div>
              <div class="product-body">
                <p class="product-category">{{ p.category_name }}</p>
                <h3 class="product-name">{{ p.name }}</h3>
                @if (p.description) {
                  <p class="product-desc">{{ p.description }}</p>
                }
                <div class="product-footer">
                  <span class="product-price">{{ formatPrice(p.price) }}</span>
                  @if (p.stock > 0) {
                    <button
                      class="btn btn-primary btn-sm"
                      (click)="addToCart(p)"
                      [class.added]="isAdded(p.id)"
                    >
                      {{ isAdded(p.id) ? '✓ В корзине' : 'В корзину' }}
                    </button>
                  } @else {
                    <span class="out-of-stock">Нет в наличии</span>
                  }
                </div>
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

    /* AI Search */
    .ai-search-block {
      background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
      border: 1px solid #BFDBFE;
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ai-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary);

      .ai-icon { font-size: 16px; }
    }

    .ai-input-row {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .ai-input {
      flex: 1;
      background: var(--surface);
      border-color: #BFDBFE;

      &:focus { border-color: var(--primary); }
    }

    .ai-message {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #1E40AF;
      background: rgba(255,255,255,.7);
      border-radius: 8px;
      padding: 10px 14px;
    }

    .ai-error {
      font-size: 13px;
      color: var(--danger);
      background: #FEF2F2;
      border-radius: 8px;
      padding: 10px 14px;
    }

    /* Toolbar */
    .catalog-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .toolbar-left {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .results-count {
      font-size: 13px;
      color: var(--text-muted);
    }

    /* Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow);
      transition: box-shadow .2s, transform .2s;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
    }

    .product-img {
      height: 120px;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 700;
      color: var(--primary);
      opacity: .3;
    }

    .product-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .product-category {
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: .05em;
    }

    .product-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    .product-desc {
      font-size: 12px;
      color: var(--text-muted);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .product-price {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }

    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .btn.added {
      background: var(--success);
      &:hover { background: #15803D; }
    }

    .out-of-stock {
      font-size: 12px;
      color: var(--text-muted);
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-muted);

      span { font-size: 48px; display: block; margin-bottom: 12px; }
      p    { font-size: 16px; }
    }
  `]
})
export class CatalogComponent implements OnInit {
  private products  = signal<Product[]>([]);
  categories        = signal<Category[]>([]);
  searchQuery       = signal('');
  selectedCategory  = signal('');
  aiQuery           = '';
  aiLoading         = signal(false);
  aiError           = signal('');
  aiResult          = signal<{ message: string; products: Product[] } | null>(null);

  displayProducts = computed(() => {
    const source = this.aiResult() ? this.aiResult()!.products : this.products();
    const q   = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    return source.filter(p => {
      const matchSearch   = p.name.toLowerCase().includes(q);
      const matchCategory = !cat || p.category === +cat;
      return matchSearch && matchCategory;
    });
  });

  constructor(
    private productService:  ProductService,
    private cartService:     CartService,
    private aiSearchService: AiSearchService,
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe(data => this.products.set(data));
    this.productService.getCategories().subscribe(data => this.categories.set(data));
  }

  aiSearch() {
    if (!this.aiQuery.trim()) return;
    this.aiLoading.set(true);
    this.aiError.set('');
    this.aiResult.set(null);

    this.aiSearchService.search(this.aiQuery).subscribe({
      next: res => {
        this.aiResult.set(res);
        this.aiLoading.set(false);
      },
      error: () => {
        this.aiError.set('Ошибка AI-поиска. Попробуйте ещё раз.');
        this.aiLoading.set(false);
      }
    });
  }

  clearAi() {
    this.aiResult.set(null);
    this.aiQuery  = '';
    this.aiError.set('');
  }

  addToCart(product: Product) { this.cartService.add(product); }

  isAdded(productId: number): boolean {
    return this.cartService.cartItems().some(i => i.product.id === productId);
  }

  formatPrice(price: string) {
    return Number(price).toLocaleString('ru-RU') + ' ₸';
  }
}