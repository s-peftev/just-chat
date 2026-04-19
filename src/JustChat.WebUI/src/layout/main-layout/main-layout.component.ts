import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './components/side-bar/side-bar.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SideBarComponent,
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {

}
