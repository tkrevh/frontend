import { ApiService } from './../../services/api.service';
import { ImuConfigService } from './../../services/config.service';
import { UtilService } from './../../services/util.service';
import { PostService } from './../../services/post.service';
import { ChannelService } from './../../services/channel.service';
import { ParentComponent } from './../parent/parent.component';

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';
import { ChannelsList } from '../../models/channelsList';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Channel } from '../../models/channel';
import { SET_POSTS_LIST } from '../../reducers/postsList.reducer';
import { PostsList } from '../../models/postsList';
import { Post } from '../../models/post';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent extends ParentComponent implements OnInit {

  loading: boolean;
  posts: any;
  currentChannel: string;
  channel: Channel = new Channel();
  postsList: Observable<PostsList>;
  channelsList: Observable<ChannelsList>;

  constructor(
    private apiService: ApiService,
    private config: ImuConfigService,
    private util: UtilService,
    private chref: ChangeDetectorRef,
    private postService: PostService,
    private channelService: ChannelService,
    private store: Store<any>
  ) {
    super();
  }

  ngOnInit() {

    this.channelsList = this.store.select('channelsListReducer');

    this.postsList = this.store.select('postsListReducer');

    this.currentChannel = 'testing';

    this.loading = false;

    this.subscribers.channelsListReducer = this.channelsList.subscribe(
      channelsList => {
        this.channel = channelsList.selectedChannel;
        if (channelsList.selectedChannel.slug && channelsList.selectedChannel.slug !== '') {
          this.currentChannel = channelsList.selectedChannel.slug;
        }
        this.loading = true;
        this.apiService.get('channel/posts/' + this.currentChannel).subscribe(
          data => {
            this.loading = false;

            const postsList: PostsList = new PostsList();

            for (const post in data) {
              postsList.posts.push(
                Object.assign(
                  new Post(), data[post], {
                    createdAt: data[post]['created_at'],
                    id: data[post]['post_id']
                  }
                )
              );
            }

            this.store.dispatch({type: SET_POSTS_LIST, payload: postsList});
          }, err => {
            this.loading = false;
            console.log(err);
          }
        );
      }
    );
  }
}
