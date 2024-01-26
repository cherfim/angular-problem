import { Injectable, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, map, switchMap, tap } from 'rxjs/operators';

import { APIService } from './api.service';

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
  return job.testbook_name.toLowerCase().includes(term);
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
    private apiService: APIService) {

    this.fetchedJobs$ = this.apiService.fetchJobs().pipe(
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
  set page(page: number) {
    if (this._state.page != page) {
      this._set({ page }, false);
    }
    this._set({ page }, true, "page");
  }

  set pageSize(pageSize: number) {
    if (this._state.pageSize != pageSize) {
      this._set({ pageSize }, false);
    } else {
      this._set({ pageSize }, true, "pageSize");
    }
  }

  set searchTerm(searchTerm: string) {
    if (this._state.searchTerm != searchTerm) {
      this._set({ searchTerm }, false);
    } else {
      this._set({ searchTerm }, true, "searchTerm");
    }
  }

  set startIndex(startIndex: number) {
    if (this._state.startIndex != startIndex) {
      this._set({ startIndex }, false);
    } else {
      this._set({ startIndex }, true, "startIndex");
    }
  }

  set endIndex(endIndex: number) {
    if (this._state.endIndex != endIndex) {
      this._set({ endIndex }, false);
    } else {
      this._set({ endIndex }, true, "endIndex");
    }
  }

  set totalRecords(totalRecords: number) {
    if (this._state.totalRecords != totalRecords) {
      this._set({ totalRecords }, false);
    } else {
      this._set({ totalRecords }, true, "totalRecords");
    }
  }

  private _set(patch: Partial<State>, triggerSearch = true, caller = "") {
    console.log("caller: " + caller);
    Object.assign(this._state, patch);

    if (triggerSearch) {
      this._search$.next();
    }
  }

  /**
   * Search Method
   */
  private _search(): Observable<SearchResult> {
    const { pageSize, page, searchTerm } = this._state;

    return this.fetchedJobs$.pipe(
      map((res: any[]) => {

      let jobs = res;

      // 2. filter
      jobs = jobs.filter(job => {
        return matches(job, searchTerm, this.pipe);
      });
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
