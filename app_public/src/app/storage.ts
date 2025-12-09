import { InjectionToken } from '@angular/core';

// localStorage에 접근하기 위한 InjectionToken 생성
export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});