# Firebase setup (BIG POTATO)

Login (Google + Discord) and the global leaderboard need a Firebase project.

## 1. Create project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project → add a **Web** app
3. Copy the config object into [`js/core/firebase-config.js`](js/core/firebase-config.js)

## 2. Authentication

**Authentication → Sign-in method**

- Enable **Google**
- Enable **OpenID Connect** (or custom OAuth) for Discord:
  1. Create an app at [Discord Developer Portal](https://discord.com/developers/applications)
  2. OAuth2 → Redirects: add  
     `https://YOUR_PROJECT.firebaseapp.com/__/auth/handler`
  3. Scopes: `identify`, `email`
  4. In Firebase, create OIDC/custom provider with Discord Client ID + Secret
  5. Set `FIREBASE_DISCORD_PROVIDER_ID` in `firebase-config.js` to match (often `oidc.discord`)

**Authorized domains** (Authentication → Settings → Authorized domains):

- `localhost` (local testing)
- Your Netlify host, e.g. `yoursite.netlify.app` (no `https://`)
- Any custom domain you use (e.g. `bigpotato.example.com`)

Without the deploy host listed, Google sign-in fails with `auth/unauthorized-domain`.

OAuth will not work from `file://` — serve with a local server:

```bash
cd BIGPOTATO && python3 -m http.server 8080
```

## 3. Firestore

1. Create Firestore (production mode is fine)
2. Deploy these rules (Console → Firestore → Rules), or use [`firestore.rules`](firestore.rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{uid} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null
        && request.auth.uid == uid
        && request.resource.data.keys().hasAll(['displayName', 'bestScore'])
        && request.resource.data.bestScore is int
        && request.resource.data.bestScore >= 0;
      allow delete: if false;
    }
  }
}
```

3. Create a composite is **not** required for `orderBy('bestScore')` alone.

## 4. Behaviour

- Loading screen tracks image + audio progress
- Hub: Google / Discord login → Play / Leaderboard
- On death, best score is written to `players/{uid}` only if higher than previous
- Leaderboard shows top 50 by `bestScore`

Until `firebase-config.js` is filled in, **Play (Guest)** works locally without rankings.
