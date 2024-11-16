export interface Login {
    username: string
    password: string
}

export interface LoginResponse {
  token: string;
}

export interface Signup {
  username: string
  email: string
  password: string
  phone: string
  name: string
}

export interface User {
  id: number
  email: string
  name: string
  username: string
  password: string
  phone: string
  createdOn: string
  roleId: string
  avatarPath: string
  publicAvatarId: string
  isActive: boolean
  favouriteRestaurants: any[]
  restaurants: any[]
  reviews: any[]
  role: any
  voteReviews: any[]
}