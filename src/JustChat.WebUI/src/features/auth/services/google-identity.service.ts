import { inject, Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';

const GsiScriptSrc = 'https://accounts.google.com/gsi/client?hl=en';
const GsiScriptId = 'google-gsi-client-script';

@Injectable({
  providedIn: 'root',
})
export class GoogleIdentityService {
  private readonly ngZone = inject(NgZone);

  private scriptLoadPromise: Promise<void> | null = null;

  /** Removes rendered GIS content from the host element. */
  dispose(host: HTMLElement): void {
    host.innerHTML = '';
  }

  /**
   * Loads GIS once, then renders the official Sign-In button into {@param host}.
   * Re-invoke when navigating between pages with a new host element.
   */
  async mountSignInButton(
    host: HTMLElement,
    onCredential: (idToken: string) => void,
  ): Promise<void> {
    const clientId = environment.googleClientId?.trim();
    if (!clientId) {
      return;
    }

    await this.ensureScriptLoaded();

    const width = Math.max(280, Math.floor(host.getBoundingClientRect().width) || 400);

    this.ngZone.runOutsideAngular(() => {
      const google = window.google;
      if (!google?.accounts?.id) {
        return;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const token = response.credential;
          if (token) {
            this.ngZone.run(() => onCredential(token));
          }
        },
      });

      host.innerHTML = '';
      google.accounts.id.renderButton(host, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width,
        logo_alignment: 'left',
        locale: 'en',
      });
    });
  }

  private ensureScriptLoaded(): Promise<void> {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise;
    }

    this.scriptLoadPromise = new Promise((resolve, reject) => {
      const finish = () => {
        if (window.google?.accounts?.id) {
          resolve();
        } else {
          reject(new Error('Google Identity Services is not available after script load'));
        }
      };

      let script = document.getElementById(GsiScriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = GsiScriptId;
        script.src = GsiScriptSrc;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', finish, { once: true });
        script.addEventListener(
          'error',
          () => reject(new Error('Google Identity Services script failed to load')),
          { once: true },
        );
        document.head.appendChild(script);
        return;
      }

      if (window.google?.accounts?.id) {
        finish();
        return;
      }

      script.addEventListener('load', finish, { once: true });
      script.addEventListener(
        'error',
        () => reject(new Error('Google Identity Services script failed to load')),
        { once: true },
      );
    });

    return this.scriptLoadPromise;
  }
}
