import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchCriteria = new BehaviorSubject<{ query: string; districtIds: number[]; categoryIds: number[] }>({
    query: '',
    districtIds: [],
    categoryIds: []
  });

  searchCriteria$ = this.searchCriteria.asObservable();

  updateSearchCriteria(criteria: { query: string; districtIds: number[]; categoryIds: number[] }) {
    this.searchCriteria.next(criteria);
  }
}
