import { readFile } from 'node:fs/promises';

const files = {
  callback: 'auth/callback/index.html',
  consent: 'oauth/consent/index.html',
  landing: 'index.html',
};

const contents = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([name, path]) => [name, await readFile(path, 'utf8')]),
  ),
);

function requireText(page, text) {
  if (!contents[page].includes(text)) {
    throw new Error(`${files[page]} must contain ${JSON.stringify(text)}`);
  }
}

function forbidText(page, text) {
  if (contents[page].includes(text)) {
    throw new Error(`${files[page]} must not contain ${JSON.stringify(text)}`);
  }
}

for (const page of Object.keys(files)) {
  requireText(page, '@supabase/supabase-js@2.112.2');
  requireText(page, 'sb_publishable_');
  forbidText(page, 'service_role');
}

for (const page of ['landing', 'callback']) {
  for (const unsafeText of [
    'modernized-ai.next',
    'response_mode',
    'access_token',
    'refresh_token',
    'provider_token',
    'innerHTML',
  ]) {
    forbidText(page, unsafeText);
  }
}

requireText('callback', "const CONSENT_PATH = '/oauth/consent/'");
requireText('callback', "url.origin === location.origin && url.pathname === CONSENT_PATH");
requireText('consent', 'getAuthorizationDetails(authorizationId)');
requireText('consent', 'approveAuthorization.bind');
requireText('consent', 'denyAuthorization.bind');
requireText('consent', 'redirectFromSupabase(data?.redirect_url)');

const cname = (await readFile('CNAME', 'utf8')).trim();
if (cname !== 'auth.modernized-ai.com') {
  throw new Error(`CNAME must be auth.modernized-ai.com, received ${JSON.stringify(cname)}`);
}

console.log('Static OAuth site checks passed.');
