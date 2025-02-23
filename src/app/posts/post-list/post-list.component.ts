import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { Post} from '../post.model';
import { PostsService } from '../posts.service';

@Component({
 selector: 'app-post-list',
 templateUrl: './post-list.component.html',
 styleUrls: ['./post-list.component.css']

})
export class PostListComponent implements OnInit, OnDestroy{
    
    posts: Post[] = [];
    private postsSub!: Subscription;
    // @input() posts = [
    // {title: '1st title', content: '1st content'},
    // ]
    constructor(public postsService: PostsService){

    }
    ngOnInit() {
        this.postsService.getPosts(); // Call the method but don't assign it
      
        this.postsSub = this.postsService.getPostUpdatedListener()
          .subscribe((posts: Post[]) => {
            this.posts = posts;
          });
      }
    ngOnDestroy() {
        if (this.postsSub) {
            this.postsSub.unsubscribe();
        }
    }
}