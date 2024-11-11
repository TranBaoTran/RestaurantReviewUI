export interface District {
    id: number
    name: string
    provinceId: number
    isActive: boolean
    restaurantCount: number
}

export interface Province {
    id: number
    name: string
    isActive: boolean
    resCount: number
    districts: District[]
}