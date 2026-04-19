import { MessageSentiment } from "../../core/enums/message-sentiment.enum";
import { UserProfileDetails } from "../profile/user-profile-details.dto";

export interface Message {
    text: string;
    createdAt: string;
    sentiment: MessageSentiment;
    sender: UserProfileDetails;
}