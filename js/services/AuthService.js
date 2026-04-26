import { IS_CHROME } from './StorageService.js';

export class AuthService {
  static getAuthToken(interactive = false) {
    return new Promise((res) => {
      if (!IS_CHROME || !chrome.identity) return res(null);

      const manifest = chrome.runtime.getManifest();
      const clientId = manifest.oauth2?.client_id;
      const scopes = manifest.oauth2?.scopes?.join(' ');

      if (!clientId) {
        if (interactive) alert("Google OAuth Client ID is missing in manifest.json.");
        return res(null);
      }

      const redirectUrl = chrome.identity.getRedirectURL();
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${encodeURIComponent(scopes)}`;

      chrome.identity.launchWebAuthFlow({ url: authUrl, interactive }, responseUrl => {
        if (chrome.runtime.lastError || !responseUrl) {
          if (interactive) {
            const errMsg = chrome.runtime.lastError?.message || "User cancelled or unknown error";
            alert("Connection failed: " + errMsg + "\n\nImportant: Ensure your Redirect URI is authorized in Google Cloud Console:\n" + redirectUrl);
          }
          return res(null);
        }
        const token = new URLSearchParams(new URL(responseUrl).hash.substring(1)).get('access_token');
        res(token || null);
      });
    });
  }
}
