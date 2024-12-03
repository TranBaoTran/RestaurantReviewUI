export interface Restaurant {
    id: number
    name: string
    address: string
    districtId: number
    districtName: string
    openedTime: string
    closedTime: string
    lowestCost: number
    highestCost: number
    phone: string
    website: string
    userId: number
    status: string
    categoryNames: string[]
    selected?: boolean; 
}