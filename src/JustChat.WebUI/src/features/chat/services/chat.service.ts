import { inject, Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { ChatHub } from '../../../core/constants/hubs/chat-hub.constants';
import { ApiClientService } from '../../../core/services/app/api-client.service';
import { AuthStore } from '../../auth/store/auth.store';
import { Observable, ReplaySubject } from 'rxjs';
import { PaginatedResult } from '../../../dto/paginated-result.dto';
import { Message } from '../../../dto/chat/message.dto';
import { UserProfileDetails } from '../../../dto/profile/user-profile-details.dto';
import { ChatMessageRequest } from '../../../dto/chat/chat-message-request.dto';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { MessageApi } from '../../../core/constants/api/message-api.constants';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatHub = ChatHub;
  private hubConnection?: HubConnection;
  private _apiClient = inject(ApiClientService);
  private authStore = inject(AuthStore);

  private initChatSubject = new ReplaySubject<{ usersInChat: UserProfileDetails[]; chatMessages: PaginatedResult<Message> }>();
  private userConnectedSubject = new ReplaySubject<UserProfileDetails>();
  private userDisconnectedSubject = new ReplaySubject<string>();
  private newMessageSubject = new ReplaySubject<Message>();

  public initChat$ = this.initChatSubject.asObservable();
  public userConnected$ = this.userConnectedSubject.asObservable();
  public userDisconnected$ = this.userDisconnectedSubject.asObservable();
  public newMessage$ = this.newMessageSubject.asObservable();

  public isConnected = signal<boolean>(false);

  public createHubConnection(request: ChatMessageRequest): void {
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.chatHub.HUB_URL, {
        accessTokenFactory: () => this.authStore.accessToken() || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        this.isConnected.set(true);
        console.log('SignalR Connected');

        this.hubConnection?.invoke(this.chatHub.METHODS.CREATE_CONNECTION, request);
      })
      .catch(error => console.log(error));

    this.hubConnection.on(this.chatHub.EVENTS.INIT_CHAT, (usersInChat: UserProfileDetails[], chatMessages: PaginatedResult<Message>) => {
      this.initChatSubject.next({ usersInChat, chatMessages });
    });

    this.hubConnection.on(this.chatHub.EVENTS.USER_CONNECTED, (newUserInChat: UserProfileDetails) => {
      this.userConnectedSubject.next(newUserInChat);
    });

    this.hubConnection.on(this.chatHub.EVENTS.USER_DISCONNECTED, (leftUserId: string) => {
      this.userDisconnectedSubject.next(leftUserId);
    });

    this.hubConnection.on(this.chatHub.EVENTS.NEW_MESSAGE, (newMessage: Message) => {
      this.newMessageSubject.next(newMessage);
    });

    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection
        .stop()
        .then(() => {
          this.isConnected.set(false);
        })
        .catch(error => console.log(error));
    }
  }

  sendMessage(text: string): void {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.invoke(this.chatHub.METHODS.SEND_MESSAGE, text);
    }
  }

  loadMessages(request: ChatMessageRequest): Observable<PaginatedResult<Message>> {
    const pageNumber = request.pageNumber ?? environment.paginationDefaults.pageNumber;
    const pageSize = request.pageSize ?? environment.paginationDefaults.chatMessagesPageSize;

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (request.beforeTimeStamp) {
      params = params.set('beforeTimeStamp', request.beforeTimeStamp);
    }

    return this._apiClient.get<PaginatedResult<Message>>(MessageApi.BASE, { params });
  }
}
