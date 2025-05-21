# Custom Form Docker Deployment

This repository contains a custom form application built with Alpine.js and Express, ready to be deployed using Docker.

## Deployment to Hetzner Cloud VPS

### Prerequisites

- SSH access to your Hetzner Cloud VPS
- Docker and Docker Compose installed on your VPS
- A domain or subdomain pointing to your VPS (optional)

### Deployment Steps

1. **Clone the repository to your local machine**

```bash
git clone <repository-url>
cd custom-form
```

2. **Copy the files to your Hetzner Cloud VPS**

```bash
# Using SCP to copy files (replace with your server details)
scp -r ./* user@your-hetzner-ip:/path/to/custom-form/
```

3. **Set up environment variables on your VPS**

```bash
# SSH into your server
ssh user@your-hetzner-ip

# Navigate to the project directory
cd /path/to/custom-form/

# Create .env file from the template
cp .env.production .env

# Edit the .env file with your actual credentials
nano .env
```

4. **Build and start the Docker containers**

```bash
# Build and start the containers in detached mode
docker-compose up -d
```

5. **Access your form**

Your form will be accessible at:
- Direct access to the Node.js application: http://your-hetzner-ip:3001
- Through Nginx: http://your-hetzner-ip:8080

### SSL Configuration (Optional)

To add SSL with Let's Encrypt:

1. **Install Certbot on your VPS**

```bash
apt update
apt install certbot python3-certbot-nginx
```

2. **Obtain SSL certificate**

```bash
certbot --nginx -d your-domain.com
```

3. **Update nginx.conf to include SSL configuration**

Edit the nginx.conf file to include the SSL configuration provided by Certbot.

### Maintenance

- **View logs**

```bash
# View logs for the form application
docker-compose logs custom-form

# View logs for Nginx
docker-compose logs form-nginx
```

- **Restart containers**

```bash
docker-compose restart
```

- **Update the application**

```bash
# Pull latest changes
git pull

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build
```

## Environment Variables

The application requires the following environment variables:

- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_VERIFY_SID`: Your Twilio verify service SID
- `PORT`: The port the application will run on (default: 3001)
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## Docker Compose Services

- **custom-form**: The Node.js application running the form
- **form-nginx**: Nginx reverse proxy for the form application
