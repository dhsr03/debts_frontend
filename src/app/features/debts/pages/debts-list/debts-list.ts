import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  takeUntil,
} from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Chart, ChartConfiguration } from 'chart.js/auto';

import {
  DebtsService,
  Debt,
  DebtSummary,
} from '../../services/debts.service';
import { AuthService } from '../../../../core/auth/auth';
import { NewDebtModalComponent } from '../../components/new-debt-modal/new-debt-modal/new-debt-modal';

type FilterType = 'all' | 'pending' | 'paid';

@Component({
  selector: 'app-debts-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './debts-list.html',
  styleUrl: './debts-list.scss',
})
export class DebtsListComponent implements OnInit, OnDestroy {
  private debtsService = inject(DebtsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  userName = '';

  filterControl = new FormControl<FilterType>('all', { nonNullable: true });

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  private refreshSubject = new BehaviorSubject<void>(undefined);

  /* ===================== SUMMARY ===================== */
  summary$ = this.debtsService.getSummary().pipe(
    shareReplay(1),
  );

  private chart?: Chart;

  /* ===================== UTIL ===================== */
  private downloadFile(blob: Blob, filename: string, type: string): void {
    const url = window.URL.createObjectURL(
      new Blob([blob], { type }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /* ===================== DEBTS ===================== */
  debts$ = this.refreshSubject.pipe(
    tap(() => this.loadingSubject.next(true)),
    switchMap(() =>
      this.debtsService.getDebts('all').pipe(
        catchError(() => of([] as Debt[])),
        finalize(() => this.loadingSubject.next(false)),
      ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  filteredDebts$ = combineLatest([
    this.debts$,
    this.filterControl.valueChanges.pipe(startWith(this.filterControl.value)),
  ]).pipe(
    map(([debts, filter]) => {
      if (filter === 'all') return debts;
      return debts.filter((d) =>
        filter === 'pending'
          ? d.status === 'PENDING'
          : d.status === 'PAID',
      );
    }),
  );

  /* ===================== LIFECYCLE ===================== */
  ngOnInit(): void {
    const u = this.authService.getCurrentUser();
    if (u) this.userName = `${u.firstName} ${u.lastName}`;

    this.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary) => {
        setTimeout(() => this.renderChart(summary));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.chart) {
      this.chart.destroy();
    }
  }

  /* ===================== CHART ===================== */
  private renderChart(summary: DebtSummary): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Pagado', 'Pendiente'],
        datasets: [
          {
            data: [
              summary.totalPagado,
              summary.totalPendiente,
            ],
            backgroundColor: ['#2e7d32', '#f9a825'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    };

    const canvas = document.getElementById(
      'summaryChart',
    ) as HTMLCanvasElement;

    if (canvas) {
      this.chart = new Chart(canvas, config);
    }
  }

  /* ===================== ACTIONS ===================== */
  reloadDebts(): void {
    this.refreshSubject.next();
  }

  editDebt(debt: Debt): void {
    if (debt.status === 'PAID') {
      Swal.fire({
        icon: 'info',
        title: 'No permitido',
        text: 'Una deuda pagada no se puede editar.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    Swal.fire({
      title: 'Editar deuda',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Título" value="${debt.title}">
        <input id="swal-amount" type="number" class="swal2-input" placeholder="Monto" value="${debt.amount}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const amount = Number(
          (document.getElementById('swal-amount') as HTMLInputElement).value,
        );

        if (!title || title.length < 3) {
          Swal.showValidationMessage('El título debe tener al menos 3 caracteres');
          return;
        }

        if (!amount || amount <= 0) {
          Swal.showValidationMessage('El monto debe ser mayor a 0');
          return;
        }

        return { title, amount };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.debtsService.updateDebt(debt.id, result.value).subscribe({
        next: () => {
          this.reloadDebts();
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deuda actualizada',
              text: 'Los cambios fueron guardados correctamente',
              timer: 2000,
              timerProgressBar: true,
            });
          }, 150);
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No fue posible actualizar la deuda.',
          });
        },
      });
    });
  }

  deleteDebt(debt: Debt): void {
    if (debt.status === 'PAID') {
      Swal.fire({
        icon: 'info',
        title: 'No permitido',
        text: 'Una deuda pagada no se puede eliminar.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar deuda?',
      text: `¿Deseas eliminar "${debt.title}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d32f2f',
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.debtsService.deleteDebt(debt.id).subscribe(() => {
        this.reloadDebts();
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La deuda fue eliminada correctamente',
          timer: 2000,
        });
      });
    });
  }

  payDebt(debt: Debt): void {
    if (debt.status === 'PAID') {
      Swal.fire({
        icon: 'info',
        title: 'Deuda ya pagada',
        text: 'Esta deuda ya se encuentra pagada.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    Swal.fire({
      icon: 'question',
      title: 'Confirmar pago',
      text: `¿Marcar "${debt.title}" como pagada?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, pagar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2e7d32',
      reverseButtons: true,
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.debtsService.payDebt(debt.id).subscribe(() => {
        this.reloadDebts();
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Deuda pagada',
            timer: 2000,
            timerProgressBar: true,
          });
        }, 150);
      });
    });
  }

  exportDebts(): void {
    Swal.fire({
      title: 'Exportar deudas',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'CSV',
      cancelButtonText: 'JSON',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.debtsService.exportDebtsCsv().subscribe((blob) => {
          this.downloadFile(blob, 'deudas.csv', 'text/csv');
        });
      }

      if (result.dismiss === Swal.DismissReason.cancel) {
        this.debtsService.exportDebtsJson().subscribe((data) => {
          const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: 'application/json' },
          );
          this.downloadFile(blob, 'deudas.json', 'application/json');
        });
      }
    });
  }

  newDebt(): void {
    const ref = this.dialog.open(NewDebtModalComponent, {
      width: '450px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((r) => r && this.reloadDebts());
  }

  trackByDebtId(_: number, d: Debt): string {
    return d.id;
  }

  openDetail(id: string): void {
    this.debtsService.getDebtById(id).subscribe({
      next: (debt) => {
        Swal.fire({
          title: 'Detalle de la deuda',
          html: `
            <div style="text-align:left; font-size:14px">
              <p><strong>Título:</strong> ${debt.title}</p>
              <p><strong>Monto:</strong> ${new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              }).format(debt.amount)}</p>

              <p><strong>Estado:</strong>
                <span style="
                  padding: 4px 8px;
                  border-radius: 10px;
                  font-size: 12px;
                  font-weight: 600;
                  color: ${
                    debt.status === 'PAID' ? '#155724' : '#856404'
                  };
                  background: ${
                    debt.status === 'PAID' ? '#d4edda' : '#fff3cd'
                  };
                ">
                  ${debt.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                </span>
              </p>

              <p><strong>Fecha de creación:</strong>
                ${new Date(debt.createdAt).toLocaleDateString('es-CO')}
              </p>

              ${
                debt.paidAt
                  ? `<p><strong>Fecha de pago:</strong>
                      ${new Date(debt.paidAt).toLocaleDateString('es-CO')}
                    </p>`
                  : ''
              }
            </div>
          `,
          confirmButtonText: 'Cerrar',
          width: 420,
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible obtener el detalle de la deuda',
        });
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
