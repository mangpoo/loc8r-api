import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { User } from '../user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public formError: string = '';

  // [변경] 이름(name) 필드 제거
  public credentials = {
    email: '',
    password: ''
  };

  // [변경] 페이지 타이틀 변경
  public pageContent = {
    header: {
      title: 'Sign in to Loc8r',
      strapline: ''
    },
    sidebar: ''
  };

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
  }

  // [변경] 메소드 이름 변경 (onRegisterSubmit -> onLoginSubmit)
  public onLoginSubmit(): void {
    this.formError = '';
    if (
      !this.credentials.email ||
      !this.credentials.password
    ) {
      this.formError = 'All fields are required, please try again';
    } else {
      this.doLogin();
    }
  }

  // [변경] 메소드 이름 변경 및 로그인 로직 호출 (doRegister -> doLogin)
  private doLogin(): void {
    // API에 로그인 요청 (User 타입 캐스팅 사용)
    this.authenticationService.login(this.credentials as User)
      .then(() => {
        // 로그인 성공 시 홈으로 이동
        this.router.navigateByUrl('/');
      })
      .catch((message) => {
        this.formError = message;
      });
  }
}