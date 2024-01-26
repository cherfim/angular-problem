import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JobType } from './jobs';

@Injectable({ providedIn: 'root' })
export class APIService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient,
              private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : '');
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
 * Initialize the AuthService
 */
  initialize() {
    // Add initialization logic here
  }

  login(username: string, password: string) {
    return this.http.post<any>(`/api/login`, { username, password })
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    return this.http.post<any>('/api/logout', { "username": localStorage.getItem('currentUser')?.valueOf() })
      .pipe(map(user => {
        // remove user details and jwt token from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/account/login']);
        return user;
      }));
  }

  forgetPassword(email: string) {
    // Add forget password logic here
  }

  fetchJobs() {
    return this.http.get<any[]>(`https://api.publicapis.org/entries`)
      .pipe(map(jobs => {
        console.log(jobs);
        return Array.from(jobs);
      }));
  }

}
