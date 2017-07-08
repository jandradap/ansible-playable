'use strict';

exports = module.exports = {
  version: 'Alpha',
  // List of user roles
  userRoles: ['guest', 'user', 'admin'],
  'scriptEngine' : {
    'host' : process.env.SCRIPT_ENGINE_HOST || 'localhost',
    'user' : process.env.SCRIPT_ENGINE_USER || 'root',
    'password' : process.env.SCRIPT_ENGINE_PASSWORD || 'P@ssw0rd@123'
  },

  paths: {
    ansible_projects: '/opt/ansible-projects'
  }
};
