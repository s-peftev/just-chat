import {
  Component,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import Cropper from 'cropperjs';
import { ToastrService } from 'ngx-toastr';
import { USER_PROFILE } from '../../../../core/constants/validation.constants';

@Component({
  selector: 'app-profile-photo-crop-modal',
  imports: [],
  templateUrl: './profile-photo-crop-modal.component.html',
})
export class ProfilePhotoCropModalComponent implements OnDestroy {
  private readonly toastr = inject(ToastrService);

  /** Blob/object URL of the image to crop (caller owns lifecycle; revoke on dismiss). */
  readonly imageObjectUrl = input.required<string>();

  readonly cropped = output<File>();
  readonly dismiss = output<void>();

  protected readonly outputWidth = USER_PROFILE.MAX_AVATAR_WIDTH_PX;
  protected readonly outputHeight = USER_PROFILE.MAX_AVATAR_HEIGHT_PX;

  private cropper: Cropper | null = null;

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  protected onCropImageLoaded(event: Event): void {
    const el = event.target;
    if (el instanceof HTMLImageElement) {
      this.initCropper(el);
    }
  }

  private initCropper(image: HTMLImageElement): void {
    this.destroyCropper();
    this.cropper = new Cropper(image, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.85,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      minCropBoxWidth: 50,
      minCropBoxHeight: 50,
    });
  }

  private destroyCropper(): void {
    this.cropper?.destroy();
    this.cropper = null;
  }

  protected onBackdropClick(): void {
    this.dismiss.emit();
  }

  protected onCancel(): void {
    this.dismiss.emit();
  }

  protected onConfirm(): void {
    if (!this.cropper) {
      this.toastr.error('Cropper is not ready.');
      return;
    }

    const canvas = this.cropper.getCroppedCanvas({
      width: USER_PROFILE.MAX_AVATAR_WIDTH_PX,
      height: USER_PROFILE.MAX_AVATAR_HEIGHT_PX,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!canvas) {
      this.toastr.error('Could not crop the image.');
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.toBlobAsJpegFallback(canvas);
          return;
        }
        const file = new File([blob], 'profile-photo.webp', { type: 'image/webp' });
        this.cropped.emit(file);
      },
      'image/webp',
      0.92,
    );
  }

  private toBlobAsJpegFallback(canvas: HTMLCanvasElement): void {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.toastr.error('Could not prepare the image for upload.');
          return;
        }
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        this.cropped.emit(file);
      },
      'image/jpeg',
      0.92,
    );
  }
}
