#!/bin/bash
sudo apt-get update > /tmp/install.log

# Installing docker
sudo apt-get install -y \
    git \
    curl \
    apt-transport-https \
    ca-certificates \
    gnupg-agent \
    software-properties-common >> /tmp/install.log
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable" >> /tmp/install.log
sudo apt-get update >> /tmp/install.log
sudo apt-get -y install docker-ce docker-ce-cli containerd.io >> /tmp/install.log
sudo systemctl enable docker >> /tmp/install.log
sudo systemctl restart docker >> /tmp/install.log

# Installing docker-compose
sudo usermod -G docker debian >> /tmp/install.log
sudo usermod -G docker root >> /tmp/install.log
sudo apt-get install -y curl >> /tmp/install.log
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose >> /tmp/install.log

# Installing hyphe
sudo git clone https://github.com/medialab/hyphe.git /opt/hyphe >> /tmp/install.log
cd /opt/hyphe
sudo cp .env.example .env
sudo sed -i 's/RESTART_POLICY=no/RESTART_POLICY=unless-stopped/g' .env
sudo cp config-backend.env.example config-backend.env
sudo cp config-frontend.env.example config-frontend.env
sudo chown -R debian:debian /opt/hyphe >> /tmp/install.log
sudo /usr/local/bin/docker-compose pull >> /tmp/install.log
sudo /usr/local/bin/docker-compose up -d >> /tmp/install.log
