import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { Address } from '@core/models/user.model';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  isEditingProfile = signal(false);
  isAddingAddress = signal(false);
  editingAddressId = signal<string | null>(null);
  profileForm = {
    name: '',
    email: '',
    phone: ''
  };
  addressForm = {
    label: '',
    street: '',
    number: '',
    city: '',
    neighborhood: '',
    instructions: '',
    isDefault: false
  };
  private userService = inject(UserService);
  user = this.userService.user;
  addresses = this.userService.addresses;

  startEditProfile(): void {
    const user = this.user();
    if (user) {
      this.profileForm = {
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? ''
      };
      this.isEditingProfile.set(true);
    }
  }

  saveProfile(): void {
    this.userService.updateUser(this.profileForm);
    this.isEditingProfile.set(false);
  }

  cancelEditProfile(): void {
    this.isEditingProfile.set(false);
  }

  startAddAddress(): void {
    this.addressForm = {
      label: '',
      street: '',
      number: '',
      city: '',
      neighborhood: '',
      instructions: '',
      isDefault: this.addresses().length === 0
    };
    this.isAddingAddress.set(true);
    this.editingAddressId.set(null);
  }

  startEditAddress(address: Address): void {
    this.addressForm = {
      label: address.label,
      street: address.street,
      number: address.number,
      city: address.city,
      neighborhood: address.neighborhood,
      instructions: address.instructions || '',
      isDefault: address.isDefault
    };
    this.editingAddressId.set(address.id);
    this.isAddingAddress.set(true);
  }

  saveAddress(): void {
    if (this.editingAddressId())
      this.userService.updateAddress(this.editingAddressId()!, this.addressForm);
    else this.userService.addAddress(this.addressForm);

    this.isAddingAddress.set(false);
    this.editingAddressId.set(null);
  }

  cancelAddress(): void {
    this.isAddingAddress.set(false);
    this.editingAddressId.set(null);
  }

  deleteAddress(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta dirección?'))
      this.userService.deleteAddress(id);
  }

  setDefaultAddress(id: string): void {
    this.userService.setDefaultAddress(id);
  }
}
