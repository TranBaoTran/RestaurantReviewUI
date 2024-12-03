export interface District {
    id: number;
    name: string;
    province:{
      id: number;
      name: string;
    }
    isActive: boolean;
  }
  
  // DTO dùng để gửi lên API khi tạo mới district
  export interface CreateDistrictDTO {
    id: number,
    name: string;
    provinceId: number;
    isActive: boolean;
  }
  