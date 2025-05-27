import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppComponent } from './app.component';
import { PostCreateComponent } from './posts/create-post/post.create.component';
import { FormsModule } from '@angular/forms';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { Headercomponent } from './header/header.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { PostListComponent } from './posts/post-list/post-list.component';
import { HttpClientModule,HTTP_INTERCEPTORS  } from '@angular/common/http';
import { AppRoutingModule } from './posts/app-routing.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ReactiveFormsModule} from '@angular/forms';  
import {MatPaginatorModule} from '@angular/material/paginator';
import { LoginComponent } from './authentication/login/login.component';
import { SignupComponent } from './authentication/signup/signup.component';
import { AuthInterceptor } from './authentication/auth-interceptor';
import { AuthService } from './authentication/auth.service';
import { PostsService } from './posts/posts.service';


@NgModule({
  declarations: [
    AppComponent,
    PostCreateComponent,
    Headercomponent,
    PostListComponent,
    LoginComponent,
    SignupComponent
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    ReactiveFormsModule, 
    MatIconModule,
    MatToolbarModule,
    HttpClientModule,
    AppRoutingModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatPaginatorModule
  ],
  providers: [
    PostsService, 
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
