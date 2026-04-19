import { environment } from "../../../environments/environment";

export const ChatHub = {
    HUB_URL: environment.hubUrl + 'chat',
    EVENTS: {
        INIT_CHAT: 'InitChat',
        USER_CONNECTED: 'UserConnected',
        USER_DISCONNECTED: 'UserDisconnected',
        NEW_MESSAGE: 'NewMessage'
    },
    METHODS: {
        CREATE_CONNECTION: 'CreateConnectionAsync',
        SEND_MESSAGE: 'SendMessageAsync'
    }
}