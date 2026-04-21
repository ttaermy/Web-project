import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin/products/products.component').then(m => m.ProductsComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./admin/orders/orders.component').then(m => m.OrdersComponent),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./admin/audit/audit.component').then(m => m.AuditComponent),
      },
    ],
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./shop/layout/shop-layout.component').then(m => m.ShopLayoutComponent),
    children: [
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./shop/catalog/catalog.component').then(m => m.CatalogComponent),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./shop/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./shop/product/product.component').then(m => m.ProductDetailComponent),
      },
      {
        path: 'track',
        loadComponent: () =>
          import('./shop/track/track.component').then(m => m.TrackComponent),
      },
      {
        path: 'track/:code',
        loadComponent: () =>
          import('./shop/track/track.component').then(m => m.TrackComponent),
      },
    ],
  },
  { path: '', redirectTo: 'shop', pathMatch: 'full' },
  { path: '**', redirectTo: 'shop' },
];
