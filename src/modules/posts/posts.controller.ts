import {
  Controller,
  UseGuards,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Get,
  Query,
  Put,
  BadRequestException,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CurrentUser } from '../../decorators/current-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { imageFileFilter } from '../auth/file-helper';
import { PostsService } from './posts.service';
import { PostDto } from '../../dto/post.dto';
import { PostCommentDto } from '../../dto/post-comment.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  @UseInterceptors(
    FilesInterceptor('photos', 6, {
      fileFilter: imageFileFilter,
    }),
  )
  async createPost(
    @CurrentUser() currentUser,
    @Req() req: any,
    @Body() postDto: PostDto,
    @UploadedFiles() photos: Array<Express.Multer.File>,
  ) {
    if (!photos || req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image files allowed]',
      );
    }
    return this.postsService.createPost(postDto, photos, currentUser._id);
  }

  @Get('')
  async getPosts(@Query('page') page: number) {
    return this.postsService.getPosts(page);
  }

  @Get('/missing')
  async getMissingPosts(@Query('page') page: number) {
    return this.postsService.getMissingPosts(page);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comment')
  async addPostComment(
    @CurrentUser() currentUser,
    @Param('postId') postId,
    @Body() commentText: PostCommentDto,
  ) {
    return this.postsService.addPostComment(
      postId,
      commentText,
      currentUser._id,
    );
  }

  @Delete(':postId/comment/:commentId')
  async deletePostComment(@Param('commentId') commentId) {
    return this.postsService.deletePostComment(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId/like')
  async putPostLike(@CurrentUser() currentUser, @Param('postId') postId) {
    return this.postsService.putPostLike(postId, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/like')
  async deletePostLike(@CurrentUser() currentUser, @Param('postId') postId) {
    return this.postsService.deletePostLike(postId, currentUser._id);
  }

  @Get(':postId/comments')
  async getPostComments(@Param('postId') postId) {
    return this.postsService.getPostComments(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId/comments/:commentId/like')
  async putPostCommentLike(
    @Param('commentId') commentId,
    @CurrentUser() currentUser,
  ) {
    return this.postsService.putPostCommentLike(commentId, currentUser._id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/comments/:commentId/like')
  async deletePostCommentLike(
    @Param('commentId') commentId,
    @CurrentUser() currentUser,
  ) {
    return this.postsService.deletePostCommentLike(commentId, currentUser._id);
  }
}
