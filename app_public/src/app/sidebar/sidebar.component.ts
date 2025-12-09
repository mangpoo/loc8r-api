import { Component, Input } from '@angular/core'; // [수정] Input 임포트

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // [추가] 부모로부터 content 데이터를 받음
  @Input() content!: string;
}