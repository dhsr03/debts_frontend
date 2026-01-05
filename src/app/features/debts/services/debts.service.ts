import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Debt {
  id: string;
  title: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface DebtSummary {
  totalPagado: number;
  totalPendiente: number;
  cantidadPagadas: number;
  cantidadPendientes: number;
}

export interface CreateDebtDto {
  title: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class DebtsService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDebts(status: 'all' | 'pending' | 'paid' = 'all'): Observable<Debt[]> {
    const timestamp = new Date().getTime();
    return this.http
      .get<Debt[]>(`${this.api}/debts`, {
        params: {
          ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
          _t: timestamp.toString(),
        },
        withCredentials: true,
      })
      .pipe(
        tap((debts) => console.log('Deudas recibidas del servidor:', debts)),
      );
  }

  getSummary(): Observable<DebtSummary> {
    return this.http.get<DebtSummary>(`${this.api}/debts/summary`, {
      withCredentials: true,
    });
  }

  createDebt(data: CreateDebtDto): Observable<Debt> {
    return this.http
      .post<Debt>(`${this.api}/debts`, data, {
        withCredentials: true,
      })
      .pipe(tap((debt) => console.log('Deuda creada:', debt)));
  }

  payDebt(id: string): Observable<Debt> {
    return this.http.post<Debt>(
      `${this.api}/debts/${id}/pay`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  deleteDebt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/debts/${id}`, {
      withCredentials: true,
    });
  }

  updateDebt(id: string, data: Partial<Debt>) {
    return this.http.patch<Debt>(`${this.api}/debts/${id}`, data, {
      withCredentials: true,
    });
  }

  exportDebtsCsv(): Observable<Blob> {
    return this.http.get(`${this.api}/debts/export`, {
      params: { format: 'csv' },
      responseType: 'blob',
      withCredentials: true,
    });
  }

  exportDebtsJson(): Observable<any> {
    return this.http.get(`${this.api}/debts/export`, {
      params: { format: 'json' },
      withCredentials: true,
    });
  }

  getDebtById(id: string): Observable<Debt> {
    return this.http.get<Debt>(`${this.api}/debts/${id}`, {
      withCredentials: true,
    });
  }
}