'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URI_DEV || 'mongodb://db/app2-dev'
  },

  // Seed database on startup
  seedDB: true

};
