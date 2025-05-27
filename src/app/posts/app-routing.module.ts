import { NgModule } from '@angular/core';  
import { RouterModule, Routes } from '@angular/router';  
import { PostCreateComponent } from './create-post/post.create.component';
import { PostListComponent } from './post-list/post-list.component';
import { LoginComponent } from '../authentication/login/login.component';
import { SignupComponent } from '../authentication/signup/signup.component';
import { AuthGuard } from '../authentication/auth.guard';

const routes: Routes = [  
  { path: '', component: PostListComponent },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }
];  
@NgModule({  
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],  
  providers: [AuthGuard]
})  
  
export class AppRoutingModule{  
    
}  