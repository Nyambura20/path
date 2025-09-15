# 🚀 BrightPath Frontend - Deployment Guide

This guide covers deploying the BrightPath React frontend to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured
- [ ] Production build works locally
- [ ] CORS is properly configured on backend
- [ ] SSL certificates are ready (for HTTPS)

## 🌐 Environment Configuration

### Production Environment Variables
```bash
REACT_APP_API_BASE_URL=https://your-api-domain.com
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

### Staging Environment Variables
```bash
REACT_APP_API_BASE_URL=https://staging-api.your-domain.com
REACT_APP_ENV=staging
GENERATE_SOURCEMAP=true
```

## 🏗️ Build Process

### Local Production Build
```bash
# Set production environment
export REACT_APP_API_BASE_URL=https://your-api-domain.com

# Build for production
npm run build

# The build folder contains the production-ready files
```

### Using Build Scripts
```bash
# Production build with predefined settings
npm run build:prod

# Staging build
npm run build:staging
```

## 🚀 Deployment Options

### 1. Netlify (Recommended for Quick Deployment)

**Method 1: Drag & Drop**
1. Run `npm run build:prod`
2. Go to [Netlify](https://netlify.com)
3. Drag the `build` folder to the deploy area

**Method 2: Git Integration**
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variables: Add your `REACT_APP_*` vars

**Netlify Configuration (`netlify.toml`)**
```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  REACT_APP_API_BASE_URL = "https://your-api-domain.com"
  REACT_APP_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Vercel

**Method 1: Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

**Method 2: Git Integration**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

**Vercel Configuration (`vercel.json`)**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ],
  "env": {
    "REACT_APP_API_BASE_URL": "https://your-api-domain.com",
    "REACT_APP_ENV": "production"
  }
}
```

### 3. AWS S3 + CloudFront

**Step 1: Build and Upload**
```bash
# Build the project
npm run build:prod

# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://your-frontend-bucket

# Upload build files
aws s3 sync build/ s3://your-frontend-bucket --delete

# Set bucket policy for public access
aws s3api put-bucket-policy --bucket your-frontend-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-frontend-bucket/*"
    }
  ]
}'

# Enable static website hosting
aws s3 website s3://your-frontend-bucket --index-document index.html --error-document index.html
```

**Step 2: CloudFront Distribution**
```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "brightpath-frontend-'$(date +%s)'",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-your-frontend-bucket",
        "DomainName": "your-frontend-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-frontend-bucket",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "Comment": "BrightPath Frontend Distribution",
  "Enabled": true
}'
```

### 4. Traditional Web Server (Nginx)

**Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    root /var/www/brightpath-frontend;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Deployment Steps**
```bash
# Build the project
npm run build:prod

# Copy build files to server
scp -r build/* user@your-server:/var/www/brightpath-frontend/

# Restart Nginx
sudo systemctl restart nginx
```

### 5. Docker Deployment

**Dockerfile**
```dockerfile
# Multi-stage build
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf for Docker**
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

**Docker Commands**
```bash
# Build image
docker build -t brightpath-frontend .

# Run container
docker run -p 3000:80 brightpath-frontend

# With environment variables
docker run -p 3000:80 \
  -e REACT_APP_API_BASE_URL=https://your-api-domain.com \
  brightpath-frontend
```

## 🔧 Backend Configuration

### Django CORS Settings
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://www.your-frontend-domain.com",
]

# For development
CORS_ALLOWED_ORIGINS += [
    "http://localhost:3000",
]

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```javascript
// src/index.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics platform
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking
Consider integrating:
- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Google Analytics**: For user analytics

## 🔐 Security Considerations

### Content Security Policy
```html
<!-- In public/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://your-api-domain.com;">
```

### Environment Variables Security
- Never commit `.env` files with production secrets
- Use platform-specific environment variable management
- Rotate API keys regularly

## 🚀 Deployment Automation

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}
        REACT_APP_ENV: production
        
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './build'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🎯 Performance Optimization

### Build Optimization
```json
{
  "scripts": {
    "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
    "build:prod": "GENERATE_SOURCEMAP=false npm run build"
  }
}
```

### Caching Strategy
- Static assets: 1 year cache
- index.html: No cache
- API responses: Appropriate cache headers

---

## 🏁 Quick Deployment Summary

**For immediate deployment:**

1. **Netlify** (Easiest): `npm run build:prod` → Drag `build` folder to Netlify
2. **Vercel** (Git-based): Connect repo → Auto-deploy on push
3. **AWS S3** (Scalable): Upload to S3 → CloudFront distribution
4. **Traditional Server**: Build → Copy files → Configure web server

Choose the option that best fits your infrastructure and requirements!
