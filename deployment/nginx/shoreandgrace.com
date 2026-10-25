limit_req_zone $binary_remote_addr zone=shore_signup:10m rate=5r/m;

server {
    listen 80;
    listen [::]:80;
    server_name shoreandgrace.com www.shoreandgrace.com;

    return 301 https://shoreandgrace.com$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.shoreandgrace.com;

    ssl_certificate /etc/letsencrypt/live/shoreandgrace.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shoreandgrace.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://shoreandgrace.com$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name shoreandgrace.com;

    root /var/www/shoreandgrace.com;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/shoreandgrace.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shoreandgrace.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;

    location = /api/signup {
        limit_req zone=shore_signup burst=3 nodelay;
        client_max_body_size 4k;
        proxy_pass http://127.0.0.1:8017/signup;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)$ {
        expires 7d;
        try_files $uri =404;
    }
}
