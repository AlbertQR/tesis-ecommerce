import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { adminGuard } from '@core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('./features/about/about.component')
        .then(m => m.AboutComponent)
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./features/cart/cart.component')
        .then(m => m.CartComponent)
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./features/products/products.component')
        .then(m => m.ProductsComponent)
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/profile/profile.component')
        .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./features/orders/orders.component')
        .then(m => m.OrdersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pedido/:id',
    loadComponent: () =>
      import('./features/orders/confirmation/order-confirmation.component')
        .then(m => m.OrderConfirmationComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./features/contact/contact.component')
        .then(m => m.ContactComponent)
  },
  {
    path: 'terminos',
    loadComponent: () =>
      import('./features/legal/terms/terms.component')
        .then(m => m.TermsComponent)
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./features/legal/privacy/privacy.component')
        .then(m => m.PrivacyComponent)
  },
  {
    path: 'devoluciones',
    loadComponent: () =>
      import('./features/legal/returns/returns.component')
        .then(m => m.ReturnsComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/auth.component')
        .then(m => m.AuthComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/auth.component')
        .then(m => m.AuthComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/users/admin-users.component')
            .then(m => m.AdminUsersComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/orders-management/admin-orders.component')
            .then(m => m.AdminOrdersComponent)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/products-management/admin-products.component')
            .then(m => m.AdminProductsComponent)
      },
      {
        path: 'contenido',
        loadComponent: () =>
          import('./features/admin/content/admin-content.component')
            .then(m => m.AdminContentComponent)
      },
      {
        path: 'legal',
        loadComponent: () =>
          import('./features/admin/legal-management/admin-legal.component')
            .then(m => m.AdminLegalComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/admin/settings/admin-settings.component')
            .then(m => m.AdminSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
