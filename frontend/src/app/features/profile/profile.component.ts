import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { Address } from '../../core/models/user.model';

/**
 * Componente del perfil de usuario.
 * Permite gestionar información personal y direcciones de entrega.
 * 
 * @component ProfileComponent
 * @description Proporciona interfaz para ver y editar el perfil del usuario,
 *              gestionar direcciones de entrega, y ver estado de pedidos.
 * 
 * @example
 * ```html
 * <app-profile></app-profile>
 * ```
 * 
 * @requires UserService
 */
@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  /** Servicio de usuario para gestionar datos */
  private userService = inject(UserService);

  /**
   * Datos del usuario actual.
   * @readonly
   */
  user = this.userService.user;
  
  /**
   * Direcciones del usuario.
   * @readonly
   */
  addresses = this.userService.addresses;

  /**
   * Signal para modo de edición del perfil.
   * @type {signal<boolean>}
   */
  isEditingProfile = signal(false);
  
  /**
   * Signal para modo de agregar dirección.
   * @type {signal<boolean>}
   */
  isAddingAddress = signal(false);
  
  /**
   * Signal con el ID de la dirección en edición.
   * @type {signal<string | null>}
   */
  editingAddressId = signal<string | null>(null);

  /**
   * Datos del formulario de perfil.
   * @type {{ name: string; email: string; phone: string }}
   */
  profileForm = {
    name: '',
    email: '',
    phone: ''
  };

  /**
   * Datos del formulario de dirección.
   * @type {{ label: string; street: string; number: string; city: string; neighborhood: string; instructions: string; isDefault: boolean }}
   */
  addressForm = {
    label: '',
    street: '',
    number: '',
    city: '',
    neighborhood: '',
    instructions: '',
    isDefault: false
  };

  /**
   * Inicia el modo de edición del perfil.
   * Prepara el formulario con los datos actuales del usuario.
   * 
   * @method startEditProfile
   * @returns {void}
   */
  startEditProfile(): void {
    const u = this.user();
    if (u) {
      this.profileForm = { name: u.name, email: u.email, phone: u.phone };
      this.isEditingProfile.set(true);
    }
  }

  /**
   * Guarda los cambios del perfil del usuario.
   * 
   * @method saveProfile
   * @returns {void}
   */
  saveProfile(): void {
    this.userService.updateUser(this.profileForm);
    this.isEditingProfile.set(false);
  }

  /**
   * Cancela la edición del perfil.
   * 
   * @method cancelEditProfile
   * @returns {void}
   */
  cancelEditProfile(): void {
    this.isEditingProfile.set(false);
  }

  /**
   * Inicia el modo de agregar nueva dirección.
   * 
   * @method startAddAddress
   * @returns {void}
   */
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

  /**
   * Inicia el modo de editar una dirección existente.
   * 
   * @method startEditAddress
   * @param {Address} address - Dirección a editar
   * @returns {void}
   */
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

  /**
   * Guarda una dirección (nueva o editada).
   * 
   * @method saveAddress
   * @returns {void}
   */
  saveAddress(): void {
    if (this.editingAddressId()) {
      this.userService.updateAddress(this.editingAddressId()!, this.addressForm);
    } else {
      this.userService.addAddress(this.addressForm);
    }
    this.isAddingAddress.set(false);
    this.editingAddressId.set(null);
  }

  /**
   * Cancela la operación de dirección.
   * 
   * @method cancelAddress
   * @returns {void}
   */
  cancelAddress(): void {
    this.isAddingAddress.set(false);
    this.editingAddressId.set(null);
  }

  /**
   * Elimina una dirección de entrega.
   * 
   * @method deleteAddress
   * @param {string} id - ID de la dirección a eliminar
   * @returns {void}
   */
  deleteAddress(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
      this.userService.deleteAddress(id);
    }
  }

  /**
   * Establece una dirección como predeterminada.
   * 
   * @method setDefaultAddress
   * @param {string} id - ID de la dirección
   * @returns {void}
   */
  setDefaultAddress(id: string): void {
    this.userService.setDefaultAddress(id);
  }
}
