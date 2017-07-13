# Playable

[![ansible-playable](client/assets/images/banner.png)](http://ansible-playable.com)

Playable is an Ansible Playbook generator UI developed in MEAN stack using [Yeoman angular-fullstack-generator](https://github.com/angular-fullstack/generator-angular-fullstack) and built using [Docker](https://www.docker.com/). 
The tool may be used by an individual or a team to 
   - Generate Ansible Playbooks
   - Easily Search and import roles from Galaxy or Github
   - Execute and Test Playbooks (Not available in the publicly hosted version)
   - Develop custom modules and test them
   - All the above while enforcing Ansible Best Practices
  
This is a fun project I started working on from my experience working with Ansible an developing custom modules. I think it will help the Ansible community and am looking forward to assistance in developing and maintaining this project.

> Note: This project is in its initial Alpha release. Hence this is only to be used for test purpose and at your own risk.

## Demo

Try a publicly hosted live demo at [ansible-playable.com](http://www.ansible-playable.com) 

> Note: You may create projects and playbooks. But cannot execute or test them. For this you must host a private version of the tool yourself, following instructions below 

## Getting Started

The easiest way to get started is to use Docker. The latest version of the software is built using docker and is available at [Docker hub](https://hub.docker.com/r/mmumshad/ansible-playable/)
 
 Run the image to get started
```
  docker run -p 80:8080 mmumshad/ansible-playable
```

Remember to use port mapping to map http port to external host. 

Once the docker container is running visit http://<docker host\> to access the web portal. 

The above command should only be used for testing purpose as the changes you make are not saved. The projects you create are not retained after restarting docker container. 

To persist data across docker container restarts use the below command to map volumes from docker container on the docker host.
```
  docker run -p 80:8080 -v /data:/data -v /opt/ansible-projects:/opt/ansible-projects mmumshad/ansible-playable
```

This command creates two volume maps - /data and /opt/ansible-projects. These directories must pre-exist on the docker host. All changes made by the docker container will now be stored in these folders.

Checkout Advanced Topics below for more details

## Features
The tool currently supports the following features and functionality:
- Ansible Engine
  - Add one Ansible Engine/s (Ansible Controller) per project
  - Test connectivity to Ansible Engine
  - Identify Ansible version
- Ansible Projects
  - Create/Edit/Delete Ansible Projects
  - Define Ansible Inventory files and variables
  - View and edit project files
  - Create Playbooks
  - Create Plays and Tasks
  - List all available modules
  - Show module descriptions and parameters. Automatically identify parameters from documentation. (Provided the module was documented correctly in the standard format)
  - List defined variables and values from inventory files as module parameters
  - Search Roles from Github/Ansible Galaxy
  - Show ReadMe file of roles in HTML format
  - Import Roles from Github/Ansible Galaxy
- Playbook Execution
  - Execute playbooks - individual or full
    - Select custom verbose level
    - Select custom hosts
  - View Ansible output in the UI
  - Test imported Roles
  - View previous execution results
- Custom Modules
  - Auto generate custom module template as per best practice
  - Auto update documentation and parameter section based on user input
  - Provides default properties and available types in UI
  - Test developed custom module
- Admin
  - View list of users
  - Delete Users
  - View System and Server logs from the Admin tab

### Advanced options

Some advanced options on customizing execution are given below

#### External database
By default the web application uses a local mongodb instance. To use an external instance of MongoDB provide a different environmental variable using the -e parameter in docker command
 
 ```
   docker run -p 80:8080 -e MONGODB_URI=mongodb://dbuser:password@test.mlab.com/ansible-playable mmumshad/ansible-playable
 ```

#### S3 storage for projects data
By default all ansible projects and files are stored at location /opt/ansible-projects. You may map volume using docker run parameter -v to map a local volume on host to this directory.
In case you need this to be on an external S3 store, set the below environment variables:

    - AWS_ACCESS_KEY_ID=KEY
    - AWS_SECRET_ACCESS_KEY=SECRET_KEY
    - MOUNT_S3=True
    - S3_PATH=ansible-playable-storage/data
    
Example Command:
```
   docker run -p 80:8080 -e AWS_ACCESS_KEY_ID=KEY -e - AWS_SECRET_ACCESS_KEY=SECRET_KEY -e MOUNT_S3=True -e S3_PATH=ansible-playable-storage/data mmumshad/ansible-playable
```

#### Authentication

To configure Google Authentication provide the below keys:

    - DOMAIN=http://ansible-playable.com
    - GOOGLE_ID=ID
    - GOOGLE_SECRET=SECRET

> Note: you must first configure google authentication and gather the GOOGLE_ID and GOOGLE_SECRET for this.

#### Admin user account
By default the local admin account is created and the email used is "admin@example.com" and the password is "admin". Provide the below environment variables to use a different password or to recreate admin and test account

    - SEED_DB=true
    - EMAIL_USER_ADMIN=admin@playable.com
    - PASSWORD_ADMIN=ADMIN_PASSWORD
    - EMAIL_USER_TEST=test@playable.com
    - PASSWORD_TEST=TEST_ACCOUNT_PASSWORD

### Prerequisites

#### With Docker

A host with docker installed. For instructions on installing Docker on host please check [here](https://docs.docker.com/engine/installation/)  

#### Without Docker

Without Docker you will have to setup the system manually:
  
  Install the following dependencies

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 4.x.x, npm >= 2.x.x
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`
- [Ansible](https://www.ansible.org/)

  The Dockerfile in this code repository will give you the exact instructions to install dependencies and setup environment

### Developing

1. Run `npm install` to install server dependencies.

2. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

3. Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `gulp build` for building and `gulp serve` for preview.

## Testing

Running `gulp test` will run the unit tests with karma.

## Improvements
- Improve Logging
- Improve Testing - add additional test cases
- Improve Security
- Sharing projects with multiple users
- Implement Vault Support
- Integration with Active Directory/LDAP
- Improve Collaboration 
  - Sharing projects between multiple users
  - GIT integration


## License
MIT License

Copyright (c) 2017 Mumshad Mannambeth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
