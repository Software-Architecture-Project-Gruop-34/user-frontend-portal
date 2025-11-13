export interface User {
    id: number;
    email: string;
    businessName: string;
    contactPerson: string;
    phoneNumber: string;
    address: string;
    role: string;
    status: string;
    createdAt: string;
  }
  
  export interface LoginResponseData {
    token: string;
    type: string;
    user: User;
  }
  
  export interface LoginResponse {
    data: {
      success: boolean;
      message: string;
      data: LoginResponseData;
    }
  }
  
  export interface LoginCredentials {
    email?: string;
    password?: string;
  }
  
  export interface RegisterPayload extends LoginCredentials {
    businessName: string;
    contactPerson: string;
    phoneNumber: string;
    address: string;
    role: string;
  }
  
  export interface UpdateProfilePayload {
    businessName: string;
    contactPerson: string;
    phoneNumber: string;
    address: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
      token: string;
      type: string;
      user: User;
    };
  }
