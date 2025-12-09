import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  // 성공, 에러, 지원하지 않음 3가지 콜백을 받습니다.
  public getPosition(cbSuccess: any, cbError: any, cbNoGeo: any): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
    } else {
      cbNoGeo();
    }
  }
}