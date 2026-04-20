import { environment } from "../../../environments/environment";

const baseApiUrl = environment.apiUrl + 'message/';

export const MessageApi = {
    BASE: baseApiUrl
}