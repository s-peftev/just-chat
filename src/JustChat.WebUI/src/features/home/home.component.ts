import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../core/constants/routes.constants';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',

})
export class HomeComponent {
  protected readonly ROUTES = ROUTES;
}
