import { PaginatedRequest } from "../paginated-request.dto";

export interface ChatMessageRequest extends PaginatedRequest {
    beforeTimeStamp?: string,
}