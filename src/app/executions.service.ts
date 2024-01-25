import { Injectable, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface SearchResult {
  jobs: any[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

/**
 * Table Data Match with Search input
 * @param  job field value fetch
 * @param term Search the value
 */
function matches(job: any, term: string, pipe: PipeTransform) {
  return true;
}

@Injectable({
  providedIn: 'root'
})

export class AdvancedService {
  fetchedJobs: any[] = [];
  fetchedJobs$: Observable<any[]>;
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _jobs$ = new BehaviorSubject<any[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0
  };

  constructor(private pipe: DecimalPipe,
    private http: HttpClient) {

    this.fetchedJobs$ = this.http.get<any[]>(`https://my-json-server.typicode.com/typicode/demo/posts/1`).pipe(
      tap((res: any[])=>{
        this.fetchedJobs=res;
    }));

    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._jobs$.next(result.jobs);
      this._total$.next(result.total);
    });
    this._search$.next();
  }

  /**
   * Returns the value
   */
  get jobs$() { return this._jobs$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  get startIndex() { return this._state.startIndex; }
  get endIndex() { return this._state.endIndex; }
  get totalRecords() { return this._state.totalRecords; }

  /**
   * set the value
   */
  set page(page: number) { this._set({ page }); }
  set pageSize(pageSize: number) { this._set({ pageSize }); }
  set startIndex(startIndex: number) { this._set({ startIndex }); }
  set endIndex(endIndex: number) { this._set({ endIndex }); }
  set totalRecords(totalRecords: number) { this._set({ totalRecords }); }
  set searchTerm(searchTerm: string) { this._set({ searchTerm }); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  /**
   * Search Method
   */
  private _search(): Observable<SearchResult> {
    const { pageSize, page, searchTerm } = this._state;

    return this.fetchedJobs$.pipe(
      map((res: any[]) => {

      let jobs = Object.values(res);

      // 2. filter
      jobs = jobs.filter(job => matches(job, searchTerm, this.pipe));
      const total = jobs.length;

      // 3. paginate
      this.totalRecords = jobs.length;
      this._state.startIndex = (page - 1) * this.pageSize + 1;
      this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
      if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
      }
      jobs = jobs.slice(this._state.startIndex - 1, this._state.endIndex);

      return  { jobs, total } as SearchResult;

    }));

  }
}
