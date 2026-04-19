import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../../core/services/app/api-client.service';
import { Observable } from 'rxjs';
import { UserProfileApi } from '../../../core/constants/api/user-profile-api.constants';
import { UserProfileDetails } from '../../../dto/profile/user-profile-details.dto';
import { ChangePersonalInfoRequest } from '../../../dto/profile/change-personal-info-request.dto';
import { ProfilePhoto } from '../../../dto/profile/profile-photo.dto';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private _apiClient = inject(ApiClientService);

  public getMyProfile(): Observable<UserProfileDetails> {
    return this._apiClient.get<UserProfileDetails>(UserProfileApi.ME);
  }

  public changePersonalInfo(changePersonalInfoRequest: ChangePersonalInfoRequest): Observable<void> {
    return this._apiClient.patchVoid<ChangePersonalInfoRequest>(UserProfileApi.ME_PERSONAL, changePersonalInfoRequest);
  }

  public uploadProfilePhoto(photo: File): Observable<ProfilePhoto> {
    const formData = new FormData();
    formData.append('file', photo);

    return this._apiClient.post<FormData, ProfilePhoto>(UserProfileApi.PROFILE_PHOTO.UPLOAD, formData);
  }

  public deleteProfilePhoto(): Observable<void> {
    return this._apiClient.deleteVoid(UserProfileApi.PROFILE_PHOTO.DELETE);
  }
}
