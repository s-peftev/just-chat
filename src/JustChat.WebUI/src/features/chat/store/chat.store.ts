import { patchState, signalStore, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { initialChatSlice } from "./chat.slice";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { ChatService } from "../services/chat.service";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Message } from "../../../dto/chat/message.dto";
import { exhaustMap, of, pipe, tap } from "rxjs";
import { addMessage, addNewUserInChat, addPreviousMessages, removeUserFromChat, resetChatState, setMessages, setUsersInChat } from "./chat.updaters";
import { PaginatedResult } from "../../../dto/paginated-result.dto";
import { withBusy } from "../../../store-extentions/features/with-busy/with-busy.feature";
import { ChatMessageRequest } from "../../../dto/chat/chat-message-request.dto";
import { setBusy, setIdle } from "../../../store-extentions/features/with-busy/with-busy.updaters";
import { tapResponse } from "@ngrx/operators";
import { UserProfileDetails } from "../../../dto/profile/user-profile-details.dto";

export const ChatStore = signalStore(
    withState(initialChatSlice),
    withBusy(),
    withProps(() => {
        const _chatService = inject(ChatService);

        return {
            _chatService
        }
    }),
    withMethods((store) => {
        const _handleInitChat = rxMethod<{ usersInChat: UserProfileDetails[]; chatMessages: PaginatedResult<Message> }>(
            pipe(
                tap(({ usersInChat, chatMessages }) => {
                    patchState(store, setUsersInChat(usersInChat), setMessages(chatMessages));
                })
            )
        );

        const _handleUserConnected = rxMethod<UserProfileDetails>(
            pipe(
                tap((newUserInChat) => {
                    patchState(store, addNewUserInChat(newUserInChat));
                })
            )
        );

        const _handleUserDisconnected = rxMethod<string>(
            pipe(
                tap((leftUserId) => {
                    patchState(store, removeUserFromChat(leftUserId));
                })
            )
        );

        const _handleNewMessage = rxMethod<Message>(
            pipe(
                tap((newMessage) => {
                    patchState(store, addMessage(newMessage));
                })
            )
        );

        return {
            _initSubscriptions() {
                _handleInitChat(store._chatService.initChat$);
                _handleUserConnected(store._chatService.userConnected$);
                _handleUserDisconnected(store._chatService.userDisconnected$);
                _handleNewMessage(store._chatService.newMessage$);
            },

            sendMessage: rxMethod<string>(
                pipe(
                    tap((messageText) => {
                        store._chatService.sendMessage(messageText);
                    })
                )
            ),

            loadPreviousMessages() {
                const request: ChatMessageRequest = {
                    beforeTimeStamp: store.chatMessages().items[0]?.createdAt,
                    pageNumber: store.chatMessages().metadata.currentPage,
                    pageSize: store.chatMessages().metadata.pageSize
                };

                return of(request).pipe(
                    tap(() => patchState(store, setBusy())),
                    exhaustMap(req =>
                        store._chatService.loadMessages(req).pipe(
                            tapResponse({
                                next: (response) => patchState(store, addPreviousMessages(response)),
                                error: () => { },
                                finalize: () => patchState(store, setIdle())
                            })
                    )
                ));
            }
        }
    }),
    withHooks(store => {
        return {
            onInit: () => {
                if (!store._chatService.isConnected()) {
                    
                    store._chatService.createHubConnection({
                        beforeTimeStamp: undefined,
                        pageNumber: store.chatMessages().metadata.currentPage,
                        pageSize: store.chatMessages().metadata.pageSize
                    });
                    store._initSubscriptions();
                }
            },
            onDestroy: () => {
                store._chatService.stopHubConnection();
                patchState(store, resetChatState());
            }
        }
    }),
    withDevtools('chat-store')
);