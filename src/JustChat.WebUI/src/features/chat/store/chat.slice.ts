import { Message } from "../../../dto/chat/message.dto";
import { PaginatedResult } from "../../../dto/paginated-result.dto";
import { UserProfileDetails } from "../../../dto/profile/user-profile-details.dto";
import { environment } from "../../../environments/environment";

export interface ChatSlice {
    readonly chatMessages: PaginatedResult<Message>;
    readonly usersInChat: UserProfileDetails[];
}

export const initialChatSlice: ChatSlice = {
    chatMessages: {
        items: [],
        metadata: {
            currentPage: 1,
            pageSize: environment.paginationDefaults.chatMessagesPageSize,
            totalCount: 0,
            totalPages: 0
        }
    },
    usersInChat: []
}