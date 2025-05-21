# Custom Form Deployment Script for Hetzner Cloud VPS (PowerShell version)
# This script helps deploy the custom form application to a Hetzner Cloud VPS

# Configuration
$SERVER_USER = "root"  # Change this to your server username
$SERVER_IP = "65.108.146.173"        # Change this to your server IP
$SERVER_PATH = "/var/www/custom-form"  # Change this to your desired path on the server

# Check if SERVER_IP is provided
if ([string]::IsNullOrEmpty($SERVER_IP)) {
  Write-Host "Error: Please edit this script and set your SERVER_IP" -ForegroundColor Red
  exit 1
}

Write-Host "=== Custom Form Deployment ===" -ForegroundColor Cyan
Write-Host "This script will deploy the custom form to your Hetzner Cloud VPS"
Write-Host "Server: $SERVER_USER@$SERVER_IP"
Write-Host "Path: $SERVER_PATH"
Write-Host ""

# Create deployment directory
Write-Host "=== Creating deployment directory ===" -ForegroundColor Green
ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH"

# Copy files to server
Write-Host "=== Copying files to server ===" -ForegroundColor Green
scp -r Dockerfile docker-compose.yaml .dockerignore nginx.conf .env.production README.md $SERVER_USER@$SERVER_IP`:$SERVER_PATH/
scp -r public $SERVER_USER@$SERVER_IP`:$SERVER_PATH/
scp -r src $SERVER_USER@$SERVER_IP`:$SERVER_PATH/
scp package.json package-lock.json server.js tailwind.config.js postcss.config.js $SERVER_USER@$SERVER_IP`:$SERVER_PATH/

# Set up environment variables
Write-Host "=== Setting up environment variables ===" -ForegroundColor Green
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && cp .env.production .env"
Write-Host "NOTE: You will need to edit the .env file on the server with your actual credentials" -ForegroundColor Yellow
Write-Host "Run: ssh $SERVER_USER@$SERVER_IP 'nano $SERVER_PATH/.env'"

# Build and start Docker containers
Write-Host "=== Building and starting Docker containers ===" -ForegroundColor Green
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose up -d"

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host "Your form is now deployed and should be accessible at:"
Write-Host "- Direct access: http://$SERVER_IP:3001"
Write-Host "- Through Nginx: http://$SERVER_IP:8080"
Write-Host ""
Write-Host "Don't forget to:" -ForegroundColor Yellow
Write-Host "1. Edit your .env file with actual credentials"
Write-Host "2. Set up SSL if needed (see README.md)"
Write-Host "3. Configure your domain to point to the server"
