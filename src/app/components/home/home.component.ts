import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  provinceId: number | null = 2;
  private routeSub: Subscription = new Subscription();

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateProvinceId();
      }
    });

    this.updateProvinceId();
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  private updateProvinceId(): void {
    this.activatedRoute.firstChild?.paramMap.subscribe((params) => {
      const proID = params.get('query');
      if (proID) {
        this.provinceId = Number(proID);
      } else {
        this.provinceId = 2;
      }
    });
  }
}
