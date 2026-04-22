import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryItem, CreateCategoryDto } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly base = `${environment.apis.category}/api/categories`;
  constructor(private http: HttpClient) {}

  getDefaults(): Observable<CategoryItem[]> {
    return this.http.get<CategoryItem[]>(`${this.base}/defaults`);
  }

  getAllForUser(userId: number): Observable<CategoryItem[]> {
    return this.http.get<CategoryItem[]>(`${this.base}/all-for-user/${userId}`);
  }

  getById(id: number): Observable<CategoryItem> {
    return this.http.get<CategoryItem>(`${this.base}/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<void> {
    return this.http.post(this.base, dto, { responseType: 'text' }).pipe(map(() => void 0));
  }

  deactivate(id: number): Observable<void> {
    return this.http.put(`${this.base}/${id}/deactivate`, {}, { responseType: 'text' }).pipe(map(() => void 0));
  }
}
