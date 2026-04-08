import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '@core/services/category.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html'
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  
  // Exponer señales del servicio (readonly)
  categories = this.categoryService.categories;
  isLoading = this.categoryService.isLoading;
  error = this.categoryService.error;
  
  // Lista de iconos disponibles de Font Awesome
  availableIcons = [
    { value: 'fa-mug-hot', label: 'Taza de café' },
    { value: 'fa-pizza-slice', label: 'Pizza' },
    { value: 'fa-basket-shopping', label: 'Canasta' },
    { value: 'fa-burger', label: 'Hamburguesa' },
    { value: 'fa-bread-slice', label: 'Pan' },
    { value: 'fa-cake-candles', label: 'Pastel' },
    { value: 'fa-cookie', label: 'Galleta' },
    { value: 'fa-wine-glass', label: 'Vino' },
    { value: 'fa-beer-mug-empty', label: 'Cerveza' },
    { value: 'fa-glass-water', label: 'Agua' },
    { value: 'fa-fish', label: 'Pescado' },
    { value: 'fa-drumstick-bite', label: 'Pollo' },
    { value: 'fa-futbol', label: 'Deporte' },
    { value: 'fa-shirt', label: 'Ropa' },
    { value: 'fa-gift', label: 'Regalo' },
    { value: 'fa-heart', label: 'Corazón' },
    { value: 'fa-star', label: 'Estrella' },
    { value: 'fa-truck', label: 'Delivery' },
    { value: 'fa-box-open', label: 'Caja' },
    { value: 'fa-leaf', label: 'Hoja/Natural' },
    { value: 'fa-pepper-hot', label: 'Picante' },
    { value: 'fa-ice-cream', label: 'Helado' },
    { value: 'fa-apple-whole', label: 'Fruta' },
    { value: 'fa-carrot', label: 'Vegetal' },
    { value: 'fa-folder', label: 'Carpeta' }
  ];
  
  // Form state con signals
  showForm = signal(false);
  isEditing = signal(false);
  editingCategory = signal<Category | null>(null);
  showIconPicker = signal(false);
  
  formData = signal<Omit<Category, 'id'>>({
    name: '',
    description: '',
    image: '',
    icon: 'fa-folder'
  });

  // Señales para validación
  nameError = signal<string | null>(null);
  descriptionError = signal<string | null>(null);

  ngOnInit(): void {
    this.categoryService.loadCategories();
  }

  startAdd(): void {
    this.showForm.set(true);
    this.isEditing.set(false);
    this.editingCategory.set(null);
    this.formData.set({ name: '', description: '', image: '', icon: 'fa-folder' });
    this.clearErrors();
  }

  startEdit(category: Category): void {
    this.showForm.set(true);
    this.isEditing.set(true);
    this.editingCategory.set(category);
    this.formData.set({
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon || 'fa-folder'
    });
    this.clearErrors();
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.editingCategory.set(null);
    this.showIconPicker.set(false);
    this.clearErrors();
  }

  selectIcon(icon: string): void {
    this.formData.update(f => ({ ...f, icon }));
    this.showIconPicker.set(false);
  }

  getIconPreview(iconClass: string): string {
    // Retorna solo el nombre del icono sin "fa-"
    return iconClass.replace('fa-', '');
  }

  save(): void {
    const data = this.formData();
    
    // Validación
    this.clearErrors();
    let hasError = false;
    
    if (!data.name.trim()) {
      this.nameError.set('El nombre es requerido');
      hasError = true;
    }
    
    if (!data.description.trim()) {
      this.descriptionError.set('La descripción es requerida');
      hasError = true;
    }
    
    if (hasError) return;

    if (this.isEditing() && this.editingCategory()) {
      this.categoryService.updateCategory(this.editingCategory()!.id, data);
    } else {
      this.categoryService.createCategory(data);
    }
    
    this.cancelForm();
  }

  deleteCategory(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.categoryService.deleteCategory(id);
    }
  }

  private clearErrors(): void {
    this.categoryService.clearError();
    this.nameError.set(null);
    this.descriptionError.set(null);
  }
}