import { Review } from "./review.model"

  export interface Restaurant {
    id: number
    name: string
    address: string
    openedTime: string
    closedTime: string
    lowestCost: number
    highestCost: number
    phone: string
    website: string
    status: string
    districtId: number
    totalReviews: number
    averageRatings: AverageRatings
    image: Image[]
    category : ResCate[]
    reviews : Review[]
    isFavorite: boolean
  }

  export interface SentRestaurant{
    name: string
    address: string
    districtId: number
    openedTime: string
    closedTime: string
    lowestCost: number
    highestCost: number
    phone: string
    website: string
    catagoryId: number[]
  }
  
  export interface AverageRatings {
    location: number
    price: number
    quality: number
    service: number
    space: number
  }

  export interface Image {
    imgPath: string
    publicId: string
  }

  export interface ResCate {
    id : number
    name : string
  }