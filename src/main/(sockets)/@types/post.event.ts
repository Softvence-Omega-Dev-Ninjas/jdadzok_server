import { CreatePostDto } from "@project/main/(posts)/posts/dto/create.post.dto";
import { BaseSocketEvent } from "./base.types";

// Post Events
export interface PostEvent extends BaseSocketEvent {
  postId: string;
  action: "create" | "update" | "delete";
  content?: CreatePostDto;
  media?: string[];
}

export interface PostReaction extends BaseSocketEvent {
  postId: string;
  reactionType: "like" | "love" | "laugh" | "angry" | "sad";
  action: "add" | "remove";
}

export interface PostComment extends BaseSocketEvent {
  postId: string;
  commentId: string;
  content: string;
  action: "create" | "update" | "delete";
  parentCommentId?: string;
}
