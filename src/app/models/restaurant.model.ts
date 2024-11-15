export interface Restaurant {
    id: number
    name: string
    address: string
    districtId: number
    openedTime: string
    closedTime: string
    lowestCost: number
    highestCost: number
    phone: string
    website: string
    totalReviews: number 
    averageRatings: averageRatings
}

export interface averageRatings {
    location: number
    price: number
    quality: number
    service: number
    space: number
}
