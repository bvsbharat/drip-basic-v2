import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.BASIC_TECH_CLIENT_ID;
const REDIRECT_URI = process.env.BASIC_TECH_REDIRECT_URI;
const BASIC_AUTH_URL = 'https://api.basic.tech/auth/authorize';
const BASIC_TOKEN_URL = 'https://api.basic.tech/auth/token';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (code) {
    // Step 2: Exchange the code for an access token
    try {
      const tokenResponse = await fetch(BASIC_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Error exchanging code for token:', errorData);
        return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
      }

      const tokenData = await tokenResponse.json();
      // In a real application, you would store tokenData (especially access_token and refresh_token) securely.
      // For now, we'll just log it and redirect.
      console.log('Successfully obtained access token:', tokenData);

      // Redirect to a success page or the main application
      return NextResponse.redirect(new URL('/', url));

    } catch (error) {
      console.error('Error during token exchange:', error);
      return NextResponse.json({ error: 'Internal server error during token exchange' }, { status: 500 });
    }
  } else {
    // Step 1: Redirect to Basic.tech authorization endpoint
    if (!CLIENT_ID || !REDIRECT_URI) {
      return NextResponse.json({ error: 'Missing Basic.tech client ID or redirect URI environment variables' }, { status: 500 });
    }

    const authUrl = new URL(BASIC_AUTH_URL);
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', 'random_state_string'); // Use a proper CSRF token in production
    authUrl.searchParams.set('scope', 'profile'); // Adjust scope as needed

    return NextResponse.redirect(authUrl.toString());
  }
}