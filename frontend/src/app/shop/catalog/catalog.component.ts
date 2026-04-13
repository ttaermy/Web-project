import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideSparkles, LucideBot, LucideSearch, LucideX, LucideShoppingCart, LucidePackage } from '@lucide/angular';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { AiSearchService } from '../../core/services/ai-search.service';
import { Product, Category } from '../../shared/interfaces/product.interface';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideSparkles, LucideBot, LucideSearch, LucideX, LucideShoppingCart, LucidePackage],
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
          <select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)" style="max-width: 180px">
            <option value="">Все категории</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>
        <p class="results-count">{{ displayProducts().length }} товаров</p>
      </div>

      <!-- Grid -->
      @if (displayProducts().length > 0) {
        <div class="products-grid">
          @for (p of displayProducts(); track p.id) {
            <div class="product-card" (click)="openProduct(p)">
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
              <div class="product-body">
                <p class="product-price">{{ formatPrice(p.price) }}</p>
                <h3 class="product-name">{{ p.name }}</h3>
                @if (p.description) {
                  <p class="product-desc">{{ p.description }}</p>
                }
                @if (p.stock > 0) {
                  <button
                    class="btn-buy"
                    [class.added]="isAdded(p.id)"
                    (click)="$event.stopPropagation(); addToCart(p)"
                  >
                    {{ isAdded(p.id) ? '✓ В корзине' : 'Купить' }}
                  </button>
                } @else {
                  <button class="btn-buy btn-buy-disabled" disabled (click)="$event.stopPropagation()">
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

    <!-- Product detail modal -->
    @if (selectedProduct()) {
      <div class="modal-backdrop" [class.closing]="isClosing()" (click)="closeProduct()">
        <div class="product-modal" [class.closing]="isClosing()" (click)="$event.stopPropagation()">

          <button class="modal-close" (click)="closeProduct()">
            <svg lucideX [size]="20"></svg>
          </button>

          @if (selectedProduct()!.image_url) {
            <div class="modal-img">
              <img [src]="selectedProduct()!.image_url" [alt]="selectedProduct()!.name" />
            </div>
          } @else {
            <div class="modal-img modal-img-fallback">
              <svg lucidePackage [size]="64" style="opacity:.15; color: var(--primary)"></svg>
            </div>
          }

          <div class="modal-body">
            <span class="modal-category">{{ selectedProduct()!.category_name }}</span>
            <h2 class="modal-name">{{ selectedProduct()!.name }}</h2>
            <p class="modal-price">{{ formatPrice(selectedProduct()!.price) }}</p>

            @if (selectedProduct()!.description) {
              <p class="modal-desc">{{ selectedProduct()!.description }}</p>
            }

            <div class="modal-stock" [class.low]="selectedProduct()!.stock <= 5 && selectedProduct()!.stock > 0" [class.empty]="selectedProduct()!.stock === 0">
              <svg lucidePackage [size]="14"></svg>
              @if (selectedProduct()!.stock === 0) {
                Нет в наличии
              } @else if (selectedProduct()!.stock <= 5) {
                Осталось {{ selectedProduct()!.stock }} шт.
              } @else {
                В наличии: {{ selectedProduct()!.stock }} шт.
              }
            </div>

            @if (selectedProduct()!.stock > 0) {
              <button
                class="modal-buy-btn"
                [class.added]="isAdded(selectedProduct()!.id)"
                (click)="addToCart(selectedProduct()!)"
              >
                <svg lucideShoppingCart [size]="18"></svg>
                {{ isAdded(selectedProduct()!.id) ? 'Уже в корзине' : 'Добавить в корзину' }}
              </button>
            } @else {
              <button class="modal-buy-btn modal-buy-disabled" disabled>Нет в наличии</button>
            }
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .catalog { display: flex; flex-direction: column; gap: 20px; }

    /* ── AI Search ── */
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
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; color: var(--primary);
    }
    .ai-input-row { display: flex; gap: 10px; align-items: center; }
    .ai-input {
      flex: 1; background: var(--surface); border-color: #BFDBFE;
      &:focus { border-color: var(--primary); }
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
      cursor: pointer;

      &:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,.1);
        transform: translateY(-2px);
      }
    }

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

      &:hover { border-color: var(--primary); color: var(--primary); background: #EFF6FF; }
      &.added { background: var(--primary); border-color: var(--primary); color: #fff; }
    }
    .btn-buy-disabled {
      opacity: .4; cursor: not-allowed;
      &:hover { border-color: var(--border); color: var(--text); background: var(--surface); }
    }

    .empty-state {
      text-align: center; padding: 80px 20px; color: var(--text-muted);
      p { font-size: 16px; margin-top: 12px; }
    }

    /* ── Modal animations ── */
    @keyframes backdrop-in  { from { opacity: 0; }        to { opacity: 1; } }
    @keyframes backdrop-out { from { opacity: 1; }        to { opacity: 0; } }
    @keyframes modal-in     { from { opacity: 0; transform: translateY(32px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes modal-out    { from { opacity: 1; transform: translateY(0) scale(1); }       to { opacity: 0; transform: translateY(32px) scale(.97); } }

    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 500; padding: 20px;
      animation: backdrop-in .2s ease;

      &.closing { animation: backdrop-out .2s ease forwards; }
    }

    .product-modal {
      background: var(--surface);
      border-radius: 16px;
      width: 100%; max-width: 460px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 64px rgba(0,0,0,.18);
      position: relative;
      animation: modal-in .22s cubic-bezier(.34,1.3,.64,1);

      &.closing { animation: modal-out .18s ease forwards; }
    }

    .modal-close {
      position: absolute; top: 12px; right: 12px;
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(0,0,0,.06); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); transition: background .15s;
      z-index: 1;

      &:hover { background: rgba(0,0,0,.12); }
    }

    .modal-img {
      width: 100%; aspect-ratio: 16 / 9;
      background: #F3F4F6; border-radius: 16px 16px 0 0; overflow: hidden;

      img { width: 100%; height: 100%; object-fit: cover; display: block; }

      &.modal-img-fallback {
        display: flex; align-items: center; justify-content: center;
      }
    }

    .modal-body {
      padding: 20px 24px 28px;
      display: flex; flex-direction: column; gap: 10px;
    }

    .modal-category {
      font-size: 11px; font-weight: 700; letter-spacing: .08em;
      text-transform: uppercase; color: var(--primary);
    }

    .modal-name  { font-size: 20px; font-weight: 700; color: var(--text); line-height: 1.3; }
    .modal-price { font-size: 24px; font-weight: 800; color: var(--text); }

    .modal-desc  { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

    .modal-stock {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 500; color: var(--success);
      background: #F0FDF4; border-radius: 6px; padding: 6px 10px;
      width: fit-content;

      &.low   { color: #92400E; background: #FFFBEB; }
      &.empty { color: #991B1B; background: #FEF2F2; }
    }

    .modal-buy-btn {
      margin-top: 6px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 13px;
      background: var(--primary); color: #fff;
      border: none; border-radius: 10px;
      font-size: 15px; font-weight: 600; cursor: pointer;
      transition: background .15s, transform .1s;

      &:hover  { background: #1D4ED8; }
      &:active { transform: scale(.98); }
      &.added  { background: var(--success); }
    }

    .modal-buy-disabled {
      opacity: .4; cursor: not-allowed;
      background: var(--border); color: var(--text-muted);
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
  selectedProduct   = signal<Product | null>(null);
  isClosing         = signal(false);

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

  openProduct(p: Product) {
    this.isClosing.set(false);
    this.selectedProduct.set(p);
  }

  closeProduct() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.selectedProduct.set(null);
      this.isClosing.set(false);
    }, 180);
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

  clearAi() {
    this.aiResult.set(null);
    this.aiQuery = '';
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
