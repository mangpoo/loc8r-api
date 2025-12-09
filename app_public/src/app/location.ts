// 서버로 전송할 때 사용하는 타입 (사용자가 입력하는 필드만 포함)
export interface NewReview {
  author: string;
  rating: number;
  reviewText: string;
}

// 서버에서 받아오거나 모델링하는 전체 리뷰 타입 (서버가 생성하는 필드 포함)
export class Review {
  author: string = '';
  rating: number = 0;
  reviewText: string = '';
  createdOn: string = ''; 
  _id: string = '';
}

export class Location {
  _id: string = '';
  name: string = '';
  distance: number = 0;
  address: string = '';
  rating: number = 0;
  facilities: string[] = [];
  reviews: Review[] = [];
  coords: number[] = [];
  openingTimes: any[] = [];
}