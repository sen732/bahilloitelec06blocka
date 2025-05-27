import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../authentication/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  private postsSub!: Subscription;
  private authStatusSub!: Subscription;

  commentInputs: { [postId: string]: string } = {};
  searchTerm: string = '';

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;

        // Ensure default structure
        this.posts.forEach(post => {
          post.reactions ||= {};
          post.comments ||= [];
        });

        this.applySearch();
      });

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      if (this.posts.length === 1 && this.currentPage > 1) {
        this.currentPage--;
      }
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, error => {
      this.isLoading = false;
      console.error('Delete failed:', error);
    });
  }

  addReaction(postId: string, emoji: string) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.reactions ||= {};
      post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
      this.postsService.saveReactions(postId, post.reactions).subscribe();
    }
  }

 addComment(postId: string) {
  const commentText = this.commentInputs[postId]?.trim();
  if (!commentText) return;

  this.postsService.addComment(postId, commentText).subscribe({
    next: (updatedPost) => {
      const index = this.posts.findIndex(p => p.id === postId);
      if (index !== -1) {
        // Reassign the full post object to trigger UI update
        this.posts[index] = {
          ...this.posts[index],
          comments: updatedPost.comments
        };
        this.applySearch(); // Reapply filter if search is active
      }
      this.commentInputs[postId] = '';
    },
    error: (err) => {
      console.error('Error adding comment:', err);
    }
  });
}


  hasComments(comments: string[]): boolean {
    return Array.isArray(comments) && comments.length > 0;
  }

  applySearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredPosts = this.posts.filter(post =>
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term)
    );
  }

  onSearchChange() {
    this.applySearch();
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
