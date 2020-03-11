interface IAuthResponseObject {
  readonly id: string;
  readonly username: string;
  readonly accessToken: string;
  readonly expiresIn: string | number;
}
