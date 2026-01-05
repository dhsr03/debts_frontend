import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../../../core/auth/auth';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
  });

  get passwordErrors() {
    return this.form.controls.password.errors || {};
  }

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();

        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Ya puedes iniciar sesión',
          confirmButtonText: 'Aceptar',
        }).then(() => this.router.navigate(['/auth/login']));
      },
      error: err => {
        this.loading = false;
        this.cdr.detectChanges();

        Swal.fire({
          icon: 'error',
          title: 'Registro no permitido',
          text: err?.error?.message || 'Error al registrar',
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }
}
