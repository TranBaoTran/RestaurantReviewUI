export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  isActive: boolean;
  createdOn: Date;
  avatarPath: string;
  publicAvatarId: string;
  roleId: string;
}

