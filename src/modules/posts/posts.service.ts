import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../../schemas/post.schema';
import * as aws from 'aws-sdk';
import { PostEnum } from '../../enum/post.enum';
import {
  PostComment,
  PostCommentDocument,
} from '../../schemas/post-comment.schema';

@Injectable()
export class PostsService {
  s3;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(PostComment.name)
    private readonly postCommentModel: Model<PostCommentDocument>,
  ) {
    this.s3 = new aws.S3({
      params: { Bucket: configService.get('S3_BUCKET_NAME') },
      region: 'eu-central-1',
      accessKeyId: configService.get('S3_ACCESS_ID'),
      secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY'),
      s3BucketEndpoint: false,
      endpoint: 'https://s3-eu-central-1.amazonaws.com',
    });
  }

  async createPost(postDto, photos, currentUser) {
    const post = new this.postModel(postDto);
    post.user = currentUser;

    let x = 0;
    let y = 0;
    for (x; x < photos.length; ) {
      const imageBuffer = photos[x].buffer;
      x++;
      for (y; y < photos.length; y++) {
        const imageName = photos[y].originalname;

        const { Location } = await this.s3
          .upload({
            Key: `postPhotos/${imageName}`,
            Body: imageBuffer,
            ContentType: 'image/png',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .promise();

        await post.photos.push(Location);

        y++;
        break;
      }
    }
    await post.save();

    return post;
  }

  async getPosts(page: number) {
    const posts = await this.postModel
      .find({ type: 'NORMAL' })
      .limit(20)
      .skip(20 * page);
    return posts;
  }

  async getMissingPosts(page: number) {
    const posts = await this.postModel
      .find({ type: PostEnum.MISSING })
      .limit(20)
      .skip(20 * page);
    return posts;
  }

  async addPostComment(postId, commentText, currentUser) {
    const postComment = new this.postCommentModel(commentText);
    postComment.postId = postId;
    postComment.userId = currentUser;
    await postComment.save();

    return postComment;
  }

  async deletePostComment(commentId) {
    try {
      await this.postCommentModel.findByIdAndDelete(commentId);
      return true;
    } catch (err) {
      return false;
    }
  }

  async putPostLike(postId: string, currentUser) {
    const postLike = await this.postModel.updateOne(
      { _id: postId },
      { $push: { likes: currentUser } },
      { new: true },
    );
    return postLike;
  }

  async deletePostLike(postId: string, currentUser) {
    const postLike = await this.postModel.updateOne(
      { _id: postId },
      { $pull: { likes: currentUser } },
      { new: true },
    );
    return postLike;
  }

  async putPostCommentLike(commentId, currentUser) {
    const commentLike = await this.postCommentModel.updateOne(
      { _id: commentId },
      { $push: { likes: currentUser } },
      { new: true },
    );

    return commentLike;
  }

  async getPostComments(postId: string) {
    const PostComments = await this.postCommentModel.find({ postId: postId });

    return PostComments;
  }

  async deletePostCommentLike(commentId, currentUser) {
    const commentLike = await this.postCommentModel.updateOne(
      { _id: commentId },
      { $pull: { likes: currentUser } },
      { new: true },
    );

    return commentLike;
  }
}
