enum UserRoleEnum {
  ADMIN = "ADMIN",
  USER = "USER",
}

interface AuthRegisterRequest {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

interface AuthLoginRequest {
  username: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthUserAdmin {
  id: string;
  name: string;
  username: string;
}

interface AuthRegisterResponseData extends BaseResponse {
  user: AuthUser | null;
}

interface AuthLoginResponseData extends BaseResponse {
  accessToken: string;
  user: AuthUser;
}

interface AuthUserResponseData extends BaseResponse, AuthUser {}

interface AuthUserAdminResponseData extends PaginationResponse {
  admins: AuthUserAdmin[];
}

type AuthRegisterResponse = AuthRegisterResponseData;
type AuthLoginResponse = AuthLoginResponseData;
type AuthUserResponse = AuthUserResponseData;
type AuthUserAdminResponse = AuthUserAdminResponseData;
