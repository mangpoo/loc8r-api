import { Component, OnInit } from '@angular/core';
import { Loc8rDataService } from '../loc8r-data.service';
import { GeolocationService } from '../geolocation.service';
import { Location } from '../location';

@Component({
  selector: 'app-home-list',
  templateUrl: './home-list.component.html',
  styleUrls: ['./home-list.component.css']
})
export class HomeListComponent implements OnInit {

  constructor(
    private loc8rDataService: Loc8rDataService,
    private geolocationService: GeolocationService
  ) { }

  public locations!: Location[];
  public message!: string;

  ngOnInit() {
    this.getPosition();
  }

  private getPosition(): void {
    this.message = 'Getting your location...';
    
    // [수정] 브라우저 위치 찾기(geolocationService)를 주석 처리하고
    // 강제로 서울 좌표를 넣어줍니다.
    
    // this.geolocationService.getPosition(
    //   this.getLocations.bind(this),
    //   this.showError.bind(this),
    //   this.noGeo.bind(this)
    // );

    // [강제 좌표 입력]
    const staticPosition = {
      coords: {
        latitude: 37.5665,  // 위도 (서울)
        longitude: 126.9780 // 경도 (서울)
      }
    };
    this.getLocations(staticPosition);
  }

  private getLocations(position: any): void {
    this.message = 'Searching for nearby places';
    const lat: number = position.coords.latitude;
    const lng: number = position.coords.longitude;

    this.loc8rDataService
      .getLocations(lat, lng)
      .then(foundLocations => {
        this.message = foundLocations.length > 0 ? '' : 'No locations found';
        this.locations = foundLocations;
      })
      .catch(error => {
        // [추가] 에러가 나면 메시지에 띄웁니다
        this.message = error.message || error;
      });
  }

  private showError(error: any): void {
    this.message = error.message;
  }

  private noGeo(): void {
    this.message = 'Geolocation not supported by this browser.';
  }
}