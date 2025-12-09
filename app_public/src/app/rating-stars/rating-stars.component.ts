import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.css']
})
export class RatingStarsComponent implements OnInit {

  // 부모 컴포넌트로부터 별점 숫자를 받아옴 (!를 붙여 초기화 에러 방지)
  @Input() rating!: number;

  constructor() { }

  ngOnInit(): void {
  }

}