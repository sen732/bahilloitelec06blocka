export interface Post {
    id?: any;
    title: string;
    content: string;
    imagePath: string;
    reactions?: { [emoji: string]: number };
   comments?: any; 
}