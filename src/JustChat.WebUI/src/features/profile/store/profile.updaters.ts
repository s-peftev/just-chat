import { PartialStateUpdater } from "@ngrx/signals";
import { UserProfileDetails } from "../../../dto/profile/user-profile-details.dto";
import { ProfileSlice } from "./profile.slice";
import { ChangePersonalInfoRequest } from "../../../dto/profile/change-personal-info-request.dto";
import { ProfilePhoto } from "../../../dto/profile/profile-photo.dto";

export function setMyProfile(myProfile: UserProfileDetails): PartialStateUpdater<ProfileSlice> {
    return _ => ({
        userId: myProfile.userId,
        email: myProfile.email,
        firstName: myProfile.firstName ?? null,
        lastName: myProfile.lastName ?? null,
        profilePhotoUrl: myProfile.profilePhotoUrl ?? null,
    })
}

export function setProfilePhoto(profilePhotoDto: ProfilePhoto | null): PartialStateUpdater<ProfileSlice> {
    return _ => ({
        profilePhotoUrl: profilePhotoDto?.profilePhotoUrl ?? null
    })
}

export function setPersonalInfo(personalInfo: ChangePersonalInfoRequest): PartialStateUpdater<ProfileSlice> {
    return _ => ({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
    })
}