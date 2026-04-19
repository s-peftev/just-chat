import { environment } from "../../../environments/environment";

const baseApiUrl = environment.apiUrl + 'userProfile/';

export const UserProfileApi = {
    ME: baseApiUrl + 'me',
    ME_PERSONAL: baseApiUrl + 'me/personal',
    PROFILE_PHOTO: {
        UPLOAD: baseApiUrl + 'photo/upload',
        DELETE: baseApiUrl + 'photo/delete',
    },
}