export class User {
  email!: string;
  name!: string;
  password?: string; // 로그인/회원가입 시 필요하므로 추가
}