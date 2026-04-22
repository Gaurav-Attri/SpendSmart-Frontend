import { Injectable } from '@angular/core';

export interface GoogleCredentialResponse {
  credential?: string;
  clientId?: string;
  select_by?: string;
}

interface GoogleInitializeConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: string;
  logo_alignment?: 'left' | 'center';
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize(config: GoogleInitializeConfig): void;
      renderButton(parent: HTMLElement, options: GoogleButtonConfig): void;
      cancel(): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private scriptLoadPromise?: Promise<void>;

  loadClient(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise;
    }

    this.scriptLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-google-identity="true"]',
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google sign-in.')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-identity', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google sign-in.'));
      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }

  async renderButton(
    container: HTMLElement,
    clientId: string,
    callback: (response: GoogleCredentialResponse) => void,
  ): Promise<void> {
    await this.loadClient();

    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services is unavailable.');
    }

    container.innerHTML = '';

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback,
    });

    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: `${Math.max(container.clientWidth, 320)}`,
    });
  }

  cancel(): void {
    window.google?.accounts?.id.cancel();
  }
}
