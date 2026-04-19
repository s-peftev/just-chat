import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-home-layout',
  imports: [
    RouterOutlet,
    NavComponent
  ],
  templateUrl: './home-layout.component.html'
})
export class HomeLayoutComponent {

}
