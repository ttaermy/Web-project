import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product, Category, ProductForm } from '../../shared/interfaces/product.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Товары</h2>
          <p class="subtitle">{{ products().length }} позиций на складе</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Добавить товар
        </button>
      </div>
      <div class="filters card">
        <input
          type="text"
          placeholder="Поиск по названию..."
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          style="max-width: 280px"
        />
        <select
          [ngModel]="selectedCategory()"
          (ngModelChange)="selectedCategory.set($event)"
          style="max-width: 200px"
        >
          <option value="">Все категории</option>
          @for (cat of categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
        <select
          [ngModel]="stockFilter()"
          (ngModelChange)="stockFilter.set($event)"
          style="max-width: 200px"
        >
          <option value="">Весь склад</option>
          <option value="low">Мало (≤ 5)</option>
          <option value="ok">В наличии (> 5)</option>
          <option value="empty">Нет в наличии</option>
        </select>
      </div>
      <div class="card" style="padding: 0; overflow: hidden">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Склад</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filteredProducts(); track p.id) {
              <tr>
                <td>
                  <div class="product-name">{{ p.name }}</div>
                  @if (p.description) {
                    <div class="product-desc">{{ p.description }}</div>
                  }
                </td>
                <td>
                  <span class="category-badge">{{ p.category_name }}</span>
                </td>
                <td>
                  <strong>{{ formatPrice(p.price) }}</strong>
                </td>
                <td>
                  <span
                    class="stock-badge"
                    [class.low]="p.stock <= 5 && p.stock > 0"
                    [class.empty]="p.stock === 0"
                  >
                    {{ p.stock === 0 ? 'Нет' : p.stock + ' шт.' }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button class="btn btn-ghost btn-sm" (click)="openModal(p)">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Изменить
                    </button>
                    <button class="btn btn-danger btn-sm" (click)="deleteProduct(p)">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-row">Товары не найдены</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingProduct() ? 'Редактировать товар' : 'Новый товар' }}</h3>
            <button class="close-btn" (click)="closeModal()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Название *</label>
              <input type="text" placeholder="Название товара" [(ngModel)]="form.name" name="name" />
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea placeholder="Описание товара" [(ngModel)]="form.description" name="description" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Цена (₸) *</label>
                <input type="number" placeholder="0" [(ngModel)]="form.price" name="price" min="0" />
              </div>
              <div class="form-group">
                <label>Количество *</label>
                <input type="number" placeholder="0" [(ngModel)]="form.stock" name="stock" min="0" />
              </div>
            </div>

            <div class="form-group">
              <label>Категория *</label>
              <select [(ngModel)]="form.category" name="category">
                <option [ngValue]="null" disabled>Выберите категорию</option>
                @for (cat of categories(); track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="new-category">
              <input
                type="text"
                placeholder="Новая категория..."
                [ngModel]="newCategoryName()"
                (ngModelChange)="newCategoryName.set($event)"
                name="newCategory"
                style="flex: 1"
              />
              <button class="btn btn-ghost" (click)="addCategory()" [disabled]="!newCategoryName().trim()">
                Добавить
              </button>
            </div>
<div class="form-group">
  <label>Изображение товара</label>
  <div class="image-upload" (click)="fileInput.click()">
    @if (imagePreview) {
      <img [src]="imagePreview" class="image-preview" alt="preview" />
    } @else if (editingProduct()?.image_url) {
      <img [src]="editingProduct()!.image_url" class="image-preview" alt="current" />
    } @else {
      <div class="upload-placeholder">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <rect x="2" y="2" width="20" height="20" rx="3"/>
        </svg>
        <span>Нажми чтобы загрузить</span>
      </div>
    }
  </div>
  <input
    #fileInput
    type="file"
    accept="image/*"
    style="display: none"
    (change)="onFileChange($event)"
  />
  @if (imagePreview || editingProduct()?.image_url) {
    <button class="btn btn-ghost" style="margin-top: 6px" (click)="clearImage()">
      Удалить фото
    </button>
  }
</div>
            @if (formError()) {
              <div class="error-msg">{{ formError() }}</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Отмена</button>
            <button class="btn btn-primary" (click)="saveProduct()" [disabled]="saving()">
              {{ saving() ? 'Сохранение...' : (editingProduct() ? 'Сохранить' : 'Создать') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;

      h2 { font-size: 22px; font-weight: 700; }
      .subtitle { color: var(--text-muted); font-size: 13px; margin-top: 2px; }
    }

    .filters {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .product-name { font-weight: 500; }
    .product-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .category-badge {
      background: var(--bg);
      color: var(--text-muted);
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .stock-badge {
      font-size: 13px;
      font-weight: 500;
      color: var(--success);

      &.low   { color: var(--warning); }
      &.empty { color: var(--danger);  }
    }

    .actions { display: flex; gap: 8px; }
    .btn-sm  { padding: 6px 10px; font-size: 12px; }

    .empty-row {
      text-align: center;
      color: var(--text-muted);
      padding: 40px !important;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal {
      background: var(--surface);
      border-radius: var(--radius);
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,.15);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 0;

      h3 { font-size: 16px; font-weight: 600; }
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 4px;
      border-radius: 6px;
      display: flex;

      &:hover { background: var(--bg); }
    }

    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .new-category { display: flex; gap: 8px; align-items: center; }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .error-msg {
      background: #FEF2F2;
      color: var(--danger);
      border: 1px solid #FECACA;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
    }
.image-upload {
  border: 2px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .15s;

  &:hover { border-color: var(--primary); }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--text-muted);

  span { font-size: 13px; }
}

.image-preview {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}
    textarea { resize: vertical; min-height: 80px; }
  `]
})
export class ProductsComponent implements OnInit {
  products         = signal<Product[]>([]);
  categories       = signal<Category[]>([]);
  searchQuery      = signal('');
  selectedCategory = signal('');
  stockFilter      = signal('');
  showModal        = signal(false);
  editingProduct   = signal<Product | null>(null);
  saving           = signal(false);
  formError        = signal('');
  newCategoryName  = signal('');
  imagePreview: string | null = null;
  selectedFile: File | null   = null;

onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file  = input.files?.[0];
  if (!file) return;

  this.selectedFile = file;

  const reader = new FileReader();
  reader.onload = () => this.imagePreview = reader.result as string;
  reader.readAsDataURL(file);
}

clearImage() {
  this.imagePreview = null;
  this.selectedFile = null;
}
  form: ProductForm = { name: '', description: '', price: null, stock: null, category: null };

  filteredProducts = computed(() => {
    const q   = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    const sf  = this.stockFilter();
    return this.products().filter(p => {
      const matchSearch   = p.name.toLowerCase().includes(q);
      const matchCategory = !cat || p.category === +cat;
      const matchStock    = !sf
        || (sf === 'low'   && p.stock <= 5 && p.stock > 0)
        || (sf === 'ok'    && p.stock > 5)
        || (sf === 'empty' && p.stock === 0);
      return matchSearch && matchCategory && matchStock;
    });
  });

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: data => this.products.set(data),
      error: err  => console.error(err)
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: data => this.categories.set(data),
      error: err  => console.error(err)
    });
  }

  openModal(product?: Product) {
    this.editingProduct.set(product ?? null);
    this.formError.set('');
    this.form = product
      ? { name: product.name, description: product.description, price: +product.price, stock: product.stock, category: product.category }
      : { name: '', description: '', price: null, stock: null, category: null };
    this.showModal.set(true);
    this.imagePreview   = null;  
    this.selectedFile   = null;   
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct.set(null);
    this.formError.set('');
  }

 saveProduct() {
  if (!this.form.name || this.form.price === null || this.form.stock === null || !this.form.category) {
    this.formError.set('Заполните все обязательные поля');
    return;
  }
  this.saving.set(true);
  this.formError.set('');

  const formWithImage = { ...this.form, image: this.selectedFile };

  const request$ = this.editingProduct()
    ? this.productService.updateProduct(this.editingProduct()!.id, formWithImage)  // ← formWithImage
    : this.productService.createProduct(formWithImage);                             // ← formWithImage

  request$.subscribe({
    next: () => {
      this.loadProducts();
      this.closeModal();
      this.saving.set(false);
    },
    error: () => {
      this.formError.set('Ошибка при сохранении');
      this.saving.set(false);
    }
  });
}

  deleteProduct(product: Product) {
    if (!confirm(`Удалить "${product.name}"?`)) return;
    this.productService.deleteProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: err => console.error(err)
    });
  }

  addCategory() {
    if (!this.newCategoryName().trim()) return;
    this.productService.createCategory(this.newCategoryName().trim()).subscribe({
      next: cat => {
        this.categories.update(cats => [...cats, cat]);
        this.form.category = cat.id;
        this.newCategoryName.set('');
      }
    });
  }

  formatPrice(price: string) {
    return Number(price).toLocaleString('ru-RU') + ' ₸';
  }
}
