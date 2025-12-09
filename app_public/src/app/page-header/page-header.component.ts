import { Component, Input } from '@angular/core'; // [수정] Input 임포트

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {
  // [추가] 부모로부터 content 데이터를 받음
  @Input() content: any;
}