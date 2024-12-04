import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/admin/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [BaseChartDirective, CommonModule],
})
export class AdminDashboardComponent implements OnInit {

  restaurantCount: number = 0;
  userCount: number = 0;
  adminCount: number = 0;

  rankedRestaurants: any[] = [];
  averageRatingsData: any[] = [];


  // Cấu hình biểu đồ cột ngang của review và favorite
  barChartResOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y', 
    plugins: {
      legend: {
        display: true, 
        position: 'top', 
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Số lượng: ${tooltipItem.raw}`
        }
      }
    }
  };
  
  barChartResData: ChartData<'bar'> = {
    labels: [], 
    datasets: [
      {
        label: 'Số lượng bình luận',
        data: [], 
        backgroundColor: 'rgba(75, 192, 192, 0.2)', 
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Số lượng yêu thích',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.2)', 
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  // Cấu hình biểu đồ cột ngang của average
  barChartAverageOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y', 
    plugins: {
      legend: {
        display: true, 
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Số lượng: ${tooltipItem.raw}`
        }
      }
    },
    scales: {
      x: {
          stacked: true,
          display: false        
      },
      y: {
        beginAtZero: true,
        stacked: true,
      }
    }
  };

  barChartAverageData: ChartData<'bar'> = {
    labels: [], 
    datasets: [
      {
        label: 'Đánh giá tổng',
        data: [], 
        backgroundColor: 'rgba(255, 99, 132, 0.2)', 
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Vị trí',
        data: [], 
        backgroundColor: 'rgba(54, 162, 235, 0.2)', 
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Giá cả',
        data: [],
        backgroundColor: 'rgba(255, 159, 64, 0.2)', 
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      },
      {
        label: 'Chất lượng',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', 
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Phục vụ',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.2)', 
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      },
      {
        label: 'Không gian',
        data: [],
        backgroundColor: 'rgba(255, 206, 86, 0.2)', 
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }
    ]
  };
  
  
  // Cấu hình biểu đồ cột ngang của res by dis
  barChartResbyDisOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y', 
    plugins: {
      legend: {
        display: true, 
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Số lượng: ${tooltipItem.raw}`
        }
      }
    // },
    // scales: {
    //   x: {
    //       stacked: true,
    //       display: false        
    //   },
    //   y: {
    //     beginAtZero: true,
    //     stacked: true,
    //   }
    }
  };
  
  barChartResbyDisData: ChartData<'bar'> = {
    labels: [], 
    datasets: [
      {
        label: 'Số lượng',
        data: [], 
        backgroundColor: 'rgba(255, 99, 132, 0.2)', 
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

   // Cấu hình biểu đồ tròn
  pieChartUserData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Hoạt động', 'Không hoạt động'],
    datasets: [
      {
        data: [0, 0], // Dữ liệu mặc định ban đầu
        backgroundColor: ['#36A2EB', '#FF6384']
      }
    ]
  };

  pieChartUserOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      datalabels: {
        color: '#FFFFF', // Màu chữ
        formatter: (value, context) => {
          return `${value}`; // Hiển thị giá trị trực tiếp
        },
        font: {
          weight: 'bold',
          size: 20,
        }
      },
      legend: {
        position: 'top', // Vị trí legend
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadRestaurantCount();
    this.loadUserCount();
    this.loadRestaurantsByDistrict();
    this.loadRestaurantReviewAndFavoriteCounts(); 
    this.loadAverageRatings();
  }

  loadRestaurantCount(): void {
    this.dashboardService.getRestaurantCount().subscribe(
      (data) => {
        if (data && data.accepctedRestaurantsCount) {
          this.restaurantCount = data.accepctedRestaurantsCount;
        } else {
          console.error('Data does not contain ActiveRestaurants:', data);
        }
      },
      (error) => {
        console.error('Error fetching restaurant count:', error);
      }
    );
  }

  loadUserCount(): void {
    this.dashboardService.getUserCount().subscribe(data => {
      console.log('User Count:', data);
      this.userCount = data.userActiveCount;
      this.pieChartUserData = {
        labels: ['Hoạt động', 'Không hoạt động'],
        datasets: [
          {
            data: [data.userActiveCount, data.userUnActiveCount],
            backgroundColor: ['#36A2EB', '#FF6384']
          }
        ]
      };
    });
  }
  loadRestaurantsByDistrict(): void {
    this.dashboardService.getRestaurantsCountByDistrict().subscribe((data: any[]) => {
        this.barChartResbyDisData.labels = data.map(item => item.districtName);
        this.barChartResbyDisData.datasets = [
          {
            label: 'Số lượng',
            data: data.map(item => item.count),
            backgroundColor: 'rgba(255, 99, 132, 0.2)', 
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ];      
      });
    }

  loadRestaurantReviewAndFavoriteCounts(): void {
    this.dashboardService.getRestaurantReviewAndFavoriteCounts().subscribe((data: any[]) => {
      // Prepare labels and datasets
      this.rankedRestaurants = data; 
      this.barChartResData.labels = data.map(item => item.restaurantName);
      this.barChartResData.datasets = [
        {
          label: 'Số lượng bình luận', 
          data: data.map(item => item.reviewCount),
          backgroundColor: 'rgba(75, 192, 192, 0.2)', 
          borderColor: 'rgba(75, 192, 192, 1)', 
          borderWidth: 1
        },
        {
          label: 'Số lượng yêu thích', 
          data: data.map(item => item.favoriteCount), 
          backgroundColor: 'rgba(153, 102, 255, 0.2)', 
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ];
    });
  }

  loadAverageRatings(): void {
    this.dashboardService.getAverageRatings().subscribe((data: any[]) => {
      this.averageRatingsData = data;
      this.barChartAverageData.labels = data.map(item => item.restaurantName);
      console.log(this.barChartAverageData.labels);
      this.barChartAverageData.datasets = [
        {
          label: 'Đánh giá tổng',
          data: data.map(item => item.overallAverage),
          backgroundColor: 'rgba(255, 99, 132, 0.2)', 
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Vị trí',
          data: data.map(item => item.averageLocation),
          backgroundColor: 'rgba(54, 162, 235, 0.2)', 
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Giá cả',
          data: data.map(item => item.averagePrice),
          backgroundColor: 'rgba(255, 159, 64, 0.2)', 
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        },
        {
          label: 'Chất lượng',
          data: data.map(item => item.averageQuality),
          backgroundColor: 'rgba(75, 192, 192, 0.2)', 
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Phục vụ',
          data: data.map(item => item.averageService),
          backgroundColor: 'rgba(153, 102, 255, 0.2)', 
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        },
        {
          label: 'Không gian',
          data: data.map(item => item.averageSpace),
          backgroundColor: 'rgba(255, 206, 86, 0.2)', 
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }
      ]        
    })
  }
}
