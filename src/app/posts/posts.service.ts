import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string, posts: any[], maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => ({
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              reactions: post.reactions || {},
              comments: (post.comments || []).map((c: any) => typeof c === 'string' ? c : c.text) 
            })),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http
      .post<{message: string, post: Post}>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete<{message: string}>(`http://localhost:3000/api/posts/${postId}`);
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      reactions?: { [key: string]: number },
      comments?: { text: string }[]
    }>("http://localhost:3000/api/posts/" + id);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
      
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      };
    }
    this.http
      .put<{ message: string, imagePath: string }>(
        "http://localhost:3000/api/posts/" + id,
        postData
      )
      .subscribe(() => {
        this.router.navigate(["/"]);
      });
  }

  saveReactions(postId: string, reactions: { [emoji: string]: number }) {
    return this.http
      .post<{ message: string; reactions: { [key: string]: number } }>(
        `http://localhost:3000/api/posts/${postId}/reactions/save`,
        { reactions }
      )
      .pipe(
        map(response => response.reactions)
      );
  }

  // ✅ NEW: Add a comment to a post
  addComment(postId: string, commentText: string) {
    return this.http
      .post<Post>(
        `http://localhost:3000/api/posts/${postId}/comments`,
        { text: commentText }
      );
  }
}
