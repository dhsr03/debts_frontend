import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DebtsService } from '../../../services/debts.service';

@Component({
  selector: 'app-new-debt-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './new-debt-modal.html',
  styleUrl: './new-debt-modal.scss',
})
export class NewDebtModalComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private debtsService = inject(DebtsService);
  private dialogRef = inject(MatDialogRef<NewDebtModalComponent>);
  private destroy$ = new Subject<void>();

  loading = false;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    amount: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    console.log('Creando deuda:', this.form.getRawValue());

    this.debtsService
      .createDebt(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: debt => {
          console.log('Deuda creada exitosamente:', debt);
          
          // Cerrar el diálogo ANTES de mostrar el Sweet Alert
          this.dialogRef.close(true);

          // Mostrar el Sweet Alert después de un pequeño delay
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deuda creada',
              text: 'La deuda fue registrada correctamente',
              confirmButtonText: 'Aceptar',
              timer: 2000,
              timerProgressBar: true,
            });
          }, 150);
        },
        error: err => {
          console.error('Error al crear deuda:', err);
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err?.error?.message ||
              'No fue posible registrar la deuda. Por favor, intenta nuevamente.',
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  close(): void {
    if (!this.loading) {
      this.dialogRef.close(false);
    }
  }

  get titleError(): string {
    const control = this.form.get('title');
    if (control?.hasError('required')) {
      return 'El título es obligatorio';
    }
    if (control?.hasError('minlength')) {
      return 'El título debe tener al menos 3 caracteres';
    }
    return '';
  }

  get amountError(): string {
    const control = this.form.get('amount');
    if (control?.hasError('required')) {
      return 'El monto es obligatorio';
    }
    if (control?.hasError('min')) {
      return 'El monto debe ser mayor a 0';
    }
    return '';
  }
}