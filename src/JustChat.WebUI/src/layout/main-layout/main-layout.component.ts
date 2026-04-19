import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './components/side-bar/side-bar.component';

@Component({
  selector: 'app-main-layout',
  host: {
    class: 'flex h-svh max-h-svh min-h-0 w-full flex-col',
  },
  imports: [
    RouterOutlet,
    SideBarComponent,
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {

}
