import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 라우팅에 사용될 컴포넌트들을 임포트합니다.
import { HomepageComponent } from './homepage/homepage.component';
import { AboutComponent } from './about/about.component';
import { DetailsPageComponent } from './details-page/details-page.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component'; // [추가] 로그인 컴포넌트

// 라우트 경로 정의
const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'location/:locationId',
    component: DetailsPageComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login', // [추가] 로그인 페이지 라우트
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }