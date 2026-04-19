import { inject, Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';

const GsiScriptSrc = 'https://accounts.google.com/gsi/client?hl=en';
const GsiScriptId = 'google-gsi-client-script';

const RESIZE_DEBOUNCE_MS = 120;
const WIDTH_CHANGE_THRESHOLD_PX = 2;
/** Used only when the host still reports zero width after layout retries. */
const FALLBACK_BUTTON_WIDTH_PX = 400;

@Injectable({
  providedIn: 'root',
})
export class GoogleIdentityService {
  private readonly ngZone = inject(NgZone);

  private scriptLoadPromise: Promise<void> | null = null;

  private readonly resizeObservers = new WeakMap<HTMLElement, ResizeObserver>();
  private readonly resizeDebounceTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
  private readonly lastRenderedWidth = new WeakMap<HTMLElement, number>();

  /** Removes rendered GIS content from the host element. */
  dispose(host: HTMLElement): void {
    this.teardownHost(host);
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

    this.teardownHost(host);

    await this.ensureScriptLoaded();
    await this.waitForNextPaint();

    let width = this.computeButtonWidth(host);
    if (width === 0) {
      await this.waitForNextPaint();
      width = this.computeButtonWidth(host);
    }
    if (width === 0) {
      width = Math.max(280, FALLBACK_BUTTON_WIDTH_PX);
    }

    this.ngZone.runOutsideAngular(() => {
      this.renderGisButton(host, clientId, onCredential, width);
      this.lastRenderedWidth.set(host, width);
      this.attachResizeObserver(host, clientId, onCredential);
    });
  }

  private teardownHost(host: HTMLElement): void {
    const observer = this.resizeObservers.get(host);
    if (observer) {
      observer.disconnect();
      this.resizeObservers.delete(host);
    }
    const timer = this.resizeDebounceTimers.get(host);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.resizeDebounceTimers.delete(host);
    }
    this.lastRenderedWidth.delete(host);
  }

  private waitForNextPaint(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  /**
   * Returns 0 if the host has no laid-out width yet; otherwise at least 280 (GIS minimum).
   */
  private computeButtonWidth(host: HTMLElement): number {
    const raw =
      host.getBoundingClientRect().width ||
      host.clientWidth ||
      host.offsetWidth;
    const floored = Math.floor(raw);
    if (floored <= 0) {
      return 0;
    }
    return Math.max(280, floored);
  }

  private renderGisButton(
    host: HTMLElement,
    clientId: string,
    onCredential: (idToken: string) => void,
    width: number,
  ): void {
    const google = window.google;
    if (!google?.accounts?.id) {
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
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
  }

  private attachResizeObserver(
    host: HTMLElement,
    clientId: string,
    onCredential: (idToken: string) => void,
  ): void {
    const observer = new ResizeObserver(() => {
      const existing = this.resizeDebounceTimers.get(host);
      if (existing !== undefined) {
        clearTimeout(existing);
      }
      const timer = setTimeout(() => {
        this.resizeDebounceTimers.delete(host);
        const newWidth = this.computeButtonWidth(host);
        if (newWidth === 0) {
          return;
        }
        const last = this.lastRenderedWidth.get(host);
        if (
          last !== undefined &&
          Math.abs(last - newWidth) <= WIDTH_CHANGE_THRESHOLD_PX
        ) {
          return;
        }
        this.ngZone.runOutsideAngular(() => {
          this.renderGisButton(host, clientId, onCredential, newWidth);
          this.lastRenderedWidth.set(host, newWidth);
        });
      }, RESIZE_DEBOUNCE_MS);
      this.resizeDebounceTimers.set(host, timer);
    });
    observer.observe(host);
    this.resizeObservers.set(host, observer);
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
