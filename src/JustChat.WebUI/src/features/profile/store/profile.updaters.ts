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
    return _ => {
        const raw = profilePhotoDto?.profilePhotoUrl ?? null;
        const profilePhotoUrl =
            raw != null && raw.trim() !== "" ? profilePhotoUrlWithCacheBust(raw) : null;
        return { profilePhotoUrl };
    };
}

export function setPersonalInfo(personalInfo: ChangePersonalInfoRequest): PartialStateUpdater<ProfileSlice> {
    return _ => ({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
    })
}

/** Appends a cache-busting query param so the browser refetches after upload. */
function profilePhotoUrlWithCacheBust(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) {
        return url;
    }
    const sep = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${sep}t=${Date.now()}`;
}