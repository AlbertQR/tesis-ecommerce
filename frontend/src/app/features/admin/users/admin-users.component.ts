import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
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
  roleFilter = signal<'all' | 'user' | 'admin'>('all');
  isLoading = signal(false);

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
    return role === 'admin' ? 'Administrador' : 'Cliente';
  }

  getRoleClass(role: string): string {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO');
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
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
