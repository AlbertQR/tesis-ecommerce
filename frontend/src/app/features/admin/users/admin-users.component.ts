import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'employee' | 'delivery';
  createdAt: string;
}

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';

  users = signal<User[]>([]);
  searchTerm = signal('');
  roleFilter = signal<'all' | 'user' | 'admin' | 'employee' | 'delivery'>('all');
  isLoading = signal(false);

  roles = [
    { value: 'user', label: 'Cliente' },
    { value: 'admin', label: 'Administrador' },
    { value: 'employee', label: 'Empleado' },
    { value: 'delivery', label: 'Repartidor' }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.http.get<User[]>(`${this.apiUrl}/admin/users`).subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filteredUsers(): User[] {
    let result = this.users();
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    }
    if (this.roleFilter() !== 'all') {
      result = result.filter(u => u.role === this.roleFilter());
    }
    return result;
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'user': 'Cliente',
      'admin': 'Administrador',
      'employee': 'Empleado',
      'delivery': 'Repartidor'
    };
    return labels[role] || role;
  }

  getRoleClass(role: string): string {
    const classes: Record<string, string> = {
      'user': 'bg-blue-100 text-blue-800',
      'admin': 'bg-purple-100 text-purple-800',
      'employee': 'bg-green-100 text-green-800',
      'delivery': 'bg-orange-100 text-orange-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO');
  }

  updateRole(user: User, newRole: string): void {
    this.http.put<User>(`${this.apiUrl}/admin/users/${user.id}`, { role: newRole }).subscribe({
      next: (updated) => {
        this.users.update(users => users.map(u => u.id === updated.id ? updated : u));
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.http.delete(`${this.apiUrl}/admin/users/${userId}`).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== userId));
        }
      });
    }
  }
}
