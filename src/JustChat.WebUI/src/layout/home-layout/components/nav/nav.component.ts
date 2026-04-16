import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../../core/constants/routes.constants';

@Component({
  selector: 'app-nav',
  imports: [
    RouterLink
  ],
  templateUrl: './nav.component.html'
})
export class NavComponent {
  protected readonly ROUTES = ROUTES;
}
