# Pull base image.
FROM node:6.2.2

# Reset Root Password
RUN echo "root:P@ssw0rd@123" | chpasswd

# Install Ansible
RUN apt-get update && \
    apt-get install python-setuptools python-dev build-essential -y && \
    easy_install pip && \
    pip install ansible

# TO fix a bug
RUN mkdir -p /root/.config/configstore && chmod g+rwx /root /root/.config /root/.config/configstore
RUN useradd -u 1003 -d /home/app_user -m -s /bin/bash -p $(echo P@ssw0rd@123 | openssl passwd -1 -stdin) app_user

# Create data directory
RUN mkdir -p /data

RUN chown -R app_user /usr/local && chown -R app_user /home/app_user && chown -R app_user /data

# Install VIM and Openssh-Server
RUN apt-get update && apt-get install -y vim openssh-server

# Permit Root login
RUN sed -i '/PermitRootLogin */cPermitRootLogin yes' /etc/ssh/sshd_config

# Generate SSH Keys
RUN /usr/bin/ssh-keygen -A

# Start Open-ssh server
RUN service ssh start

# Install NPM dependencies
RUN npm install -g yo gulp-cli generator-angular-fullstack

# Change user to app_user
USER app_user

RUN mkdir -p /data/web-app
COPY ./package.json /data/web-app
WORKDIR /data/web-app

# Assign permissions to app_user
USER root
RUN chown -R app_user /data/web-app

# Change user to app_user
USER app_user

RUN npm install

# Copy all application files
COPY ./ /data/web-app

# Assign permissions to app_user
USER root
RUN chown -R app_user /data/web-app

ENTRYPOINT gulp serve

COPY helpers/module_template.py /opt/ehc-builder-scripts/ansible_modules/template.py
