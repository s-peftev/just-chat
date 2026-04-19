import { PartialStateUpdater } from "@ngrx/signals";
import { UserProfileDetails } from "../../../dto/profile/user-profile-details.dto";
import { ChatSlice, initialChatSlice } from "./chat.slice";
import { PaginatedResult } from "../../../dto/paginated-result.dto";
import { Message } from "../../../dto/chat/message.dto";

export function setUsersInChat(usersInChat: UserProfileDetails[]): PartialStateUpdater<ChatSlice> {
    return state => ({ 
        ...state, 
        usersInChat 
    });
}

export function addNewUserInChat(newUserInChat: UserProfileDetails): PartialStateUpdater<ChatSlice> {
    return state => {
        const exists = state.usersInChat.some(u => u.userId === newUserInChat.userId);
        if (exists) return state;

        return {
            ...state,
            usersInChat: [
                ...state.usersInChat,
                newUserInChat
            ]
        };
    }
}

export function removeUserFromChat(leftUserId: string): PartialStateUpdater<ChatSlice> {
    return state => ({
        ...state,
        usersInChat: state.usersInChat.filter(u => u.userId !== leftUserId)
    });
}

export function setMessages(chatMessages: PaginatedResult<Message>): PartialStateUpdater<ChatSlice> {
    return state => ({
        ...state,
        chatMessages
    });
}

export function addMessage(newMessage: Message): PartialStateUpdater<ChatSlice> {
    return state => ({
        ...state,
        chatMessages: {
            ...state.chatMessages,
            items: [
                ...state.chatMessages.items,
                newMessage
            ]
        }
    });
}

export function addPreviousMessages(previousMessages: PaginatedResult<Message>): PartialStateUpdater<ChatSlice> {
    return state => ({
        ...state,
        chatMessages: {
            metadata: previousMessages.metadata,
            items: [
                ...previousMessages.items,
                ...state.chatMessages.items
            ]
        }
    });
}

export function resetChatState() {
  return () => initialChatSlice;
}