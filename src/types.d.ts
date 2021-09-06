export type TAccessToken = string;
export type TRegreshToken = string;
export interface IUser {
  id?: string;
  name: string;
  last_name: string;
  phone: string;
  email: string;
  gender: string;
  age: number;
  salt?: string;
  password?: string;
}
export interface IUserCredentials {
  email: string;
  password: string;
}
export interface IResponse {
  msg: string;
}
export interface IErrorResponse extends IResponse {
  error: any | unknown;
}
export interface IUserLoginResponse extends IResponse {
  user: IUser;
  accessToken: TAccessToken;
  refreshToken: TRegreshToken;
}
export interface IUserRegisterResponse extends IUserLoginResponse {}
export interface IScholar {
  managerId: string;
  scholarAddress: string;
}
