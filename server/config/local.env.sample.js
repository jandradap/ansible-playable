'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: 'app2-secret',

  FACEBOOK_ID: 'app-id',
  FACEBOOK_SECRET: 'secret',

  GOOGLE_ID: 'app-id',
  GOOGLE_SECRET: 'secret',

  // Control debug level for modules using visionmedia/debug
  DEBUG: '',

  SCRIPT_ENGINE_HOST : 'localhost',
  SCRIPT_ENGINE_USER : 'root',
  SCRIPT_ENGINE_PASSWORD : 'P@ssw0rd@123',

  MONGODB_URI_DEV: 'mongodb://localhost/dev',

  DISABLE_PLAYBOOK_EXECUTION: true,
  DISABLE_ANSIBLE_HOST_ADDITION: true,

  PASSWORD_TEST: 'test',
  PASSWORD_ADMIN: 'admin',

  SEED_DB: false
};
