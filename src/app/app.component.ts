import { Component } from '@angular/core';
import { AuthService } from './authentication/auth.service';

interface Post {
  id: number;
  title: any;
  content: any;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bahillo';
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoAuthUser();
  }
}
  