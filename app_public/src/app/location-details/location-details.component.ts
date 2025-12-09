import { Component, OnInit, Input } from '@angular/core';
import { Location, Review, NewReview } from '../location'; // NewReview import 추가
import { Loc8rDataService } from '../loc8r-data.service';
import { AuthenticationService } from '../authentication.service';
import { User } from '../user';

@Component({
  selector: 'app-location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.css']
})
export class LocationDetailsComponent implements OnInit {

  @Input() location!: Location;

  public googleAPIKey: string = 'AIzaSyAqbmguRW4JHgEqZ1bEIX3bprSb8Z9oaCU';
  public formVisible: boolean = false;
  public formError: string = '';

  // [수정됨] NewReview 타입 명시
  public newReview: NewReview = {
    author: '',
    rating: 5,
    reviewText: ''
  };

  constructor(
    private loc8rDataService: Loc8rDataService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  public getUsername(): string {
    const user: User | null = this.authenticationService.getCurrentUser();
    return user ? user.name : 'Guest';
  }

  private formIsValid(): boolean {
    // author는 로직에서 자동 할당되므로 rating과 reviewText만 확인
    if (this.newReview.rating && this.newReview.reviewText) {
      return true;
    } else {
      return false;
    }
  }

  public onReviewSubmit(): void {
    this.formError = '';
    
    // 현재 로그인한 사용자 이름을 작성자로 자동 설정
    this.newReview.author = this.getUsername();

    if (this.formIsValid()) {
      // 서버는 Review 객체를 반환하므로 타입을 Review로 지정
      this.loc8rDataService.addReviewByLocationId(this.location._id, this.newReview)
        .then((review: Review) => { 
          console.log('Review saved', review);
          
          let reviews = this.location.reviews.slice(0);
          reviews.unshift(review);
          this.location.reviews = reviews;

          this.formVisible = false;

          // 폼 초기화
          this.newReview.author = '';
          this.newReview.rating = 5;
          this.newReview.reviewText = '';
        });
    } else {
      this.formError = 'All fields required, please try again';
    }
  }

}