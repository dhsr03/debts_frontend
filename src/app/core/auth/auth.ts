import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  private _user$ = new BehaviorSubject<User | null>(null);
  user$ = this._user$.asObservable();

  // 👇 Cache para evitar múltiples llamadas simultáneas
  private meCache$: Observable<User | null> | null = null;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post(`${this.api}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap(() => {
          // Limpiar cache después del login
          this.meCache$ = null;
          // Cargar usuario
          this.me().subscribe();
        }),
      );
  }

  logout() {
    return this.http
      .post(`${this.api}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._user$.next(null);
          this.meCache$ = null;
        }),
      );
  }

  me(): Observable<User | null> {
    // 👇 Si ya hay una petición en curso, reutilizarla
    if (this.meCache$) {
      console.log('🔄 Reutilizando petición de usuario en cache');
      return this.meCache$;
    }

    console.log('🔐 Obteniendo información del usuario');

    this.meCache$ = this.http
      .get<User>(`${this.api}/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          console.log('✅ Usuario obtenido:', user);
          this._user$.next(user);
        }),
        catchError((err) => {
          console.error('❌ Error al obtener usuario:', err);
          this._user$.next(null);
          this.meCache$ = null; // Limpiar cache en error
          return of(null);
        }),
        shareReplay(1), // 👈 Compartir resultado entre suscriptores
      );

    return this.meCache$;
  }

  isAuthenticated(): Observable<boolean> {
    // 👇 Primero verificar si ya tenemos el usuario en el BehaviorSubject
    const currentUser = this._user$.value;
    
    if (currentUser !== null) {
      console.log('✅ Usuario ya en memoria:', currentUser);
      return of(true);
    }

    // Si no hay usuario, hacer la petición
    return this.me().pipe(
      tap(user => console.log('🔍 isAuthenticated resultado:', !!user)),
      catchError(() => of(null)),
      tap(user => this._user$.next(user)),
      tap(user => console.log('🔐 Usuario autenticado:', !!user)),
      tap(user => {
        // Map to boolean - user is authenticated if user is not null
        return !!user;
      }),
      map(user => !!user),
      shareReplay(1),
    );
  }

  getCurrentUser(): User | null {
    return this._user$.value;
  }

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return this.http.post(`${this.api}/auth/register`, data, {
      withCredentials: true,
    });
  }

  clearCache(): void {
    this.meCache$ = null;
  }
}