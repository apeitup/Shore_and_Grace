# Shore & Grace deployment

The public website is the production output from `dist/`, served by Nginx from:

```text
/var/www/shoreandgrace.com/
```

The deployment script builds locally, uploads a temporary archive, validates the tracked Shore & Grace Nginx configuration, and then synchronises only the built files into the dedicated Shore & Grace document root. Published files remain owned by `root:www-data`; the directory is not made publicly writable. The previous Shore & Grace server block is retained as `shoreandgrace.com.previous` for recovery.

## Deploy an update

From the project directory, run:

```bash
./scripts/deploy.sh
```

The command may ask for the SSH key passphrase and the server `sudo` password. Enter credentials only in the terminal prompt.

## First deployment checks

Before the first release, inspect `/etc/nginx/sites-available/shoreandgrace.com` and confirm:

- the server names are `shoreandgrace.com` and `www.shoreandgrace.com`;
- the root is `/var/www/shoreandgrace.com`;
- the apex HTTPS site is canonical and `www` redirects to it;
- the Let's Encrypt certificate covers both hostnames;
- `nginx -t` passes.

Do not alter the `troyhalliday.com` server block or files.

## `.co.uk` redirect

Both `shoreandgrace.co.uk` and `www.shoreandgrace.co.uk` point to the VPS and permanently redirect to the canonical `.com` address over HTTPS. Their tracked Nginx configuration is `deployment/nginx/shoreandgrace.co.uk` and their separate Let's Encrypt certificate renews using the webroot challenge.

## Email signup

The holding-page form posts to a private Python service on `127.0.0.1:8017` through Nginx at `/api/signup`. Its SQLite database is stored outside the public website at:

```text
/var/lib/shoreandgrace-signup/subscribers.sqlite3
```

The database is owned by the service's dynamic system user and is not served by Nginx. It contains the normalised email address, UTC consent time, consent-text version and signup source. It deliberately does not store IP addresses.

To inspect service health:

```bash
sudo systemctl status shoreandgrace-signup.service
curl --fail http://127.0.0.1:8017/health
```

Before moving subscribers to a mailing provider, update the privacy policy with that provider, retention details and any international-transfer information. Preserve the consent time and consent version during import.
