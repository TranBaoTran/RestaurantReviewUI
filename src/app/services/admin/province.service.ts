import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Province } from '../../models/admin/province.model';


@Injectable({
  providedIn: 'root'
})
export class ProvinceService {
    private apiUrl = 'http://localhost:5043/DistrictAndProvince';

    constructor(private http: HttpClient) { }

    updateProvinceById(provId : number, newName : string): Observable<{message : string}> {
      return this.http.post<{message : string}>(`${this.apiUrl}/UpdateProvince/${provId}/${newName}`,null);
    }

    addProvince(name : string): Observable<{message : string}> {
      return this.http.post<{message : string}>(`${this.apiUrl}/AddProvince`, {name : name, isAcitve : true});
    }

    deleteProvince(provId : number): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/DeleteProvince/${provId}`, null);
    }

    addDistrict(name : string, provId : number): Observable<{message : string}> {
      return this.http.post<{message : string}>(`${this.apiUrl}/AddDistrict`, {name : name, provinceId : provId, isAcitve : true});
    }
}