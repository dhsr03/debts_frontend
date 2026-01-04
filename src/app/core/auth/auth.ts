import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  private _user$ = new BehaviorSubject<any | null>(null);
  user$ = this._user$.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(
      `${this.api}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
  }

  logout() {
    return this.http.post(
      `${this.api}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      map(() => this._user$.next(null))
    );
  }

  me() {
    return this.http.get(`${this.api}/auth/me`, {
      withCredentials: true,
    }).pipe(
      map(user => {
        this._user$.next(user);
        return user;
      }),
      catchError(() => {
        this._user$.next(null);
        return of(null);
      })
    );
  }

  isAuthenticated() {
    return this.me().pipe(map(user => !!user));
  }
}
