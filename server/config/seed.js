/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import config from './environment/';
import logger from '../components/logger/logger';

export default function seedDatabaseIfNeeded() {
  logger.info('seedDB = %s', config.seedDB);
  // If asked to seed DB - create Admin and Test user
  // Else create admin user at the minimum
  if(config.seedDB == "true") {
    logger.info('Removing and re-creating local users');
    User.find({}).remove()
      .then(() => {
        User.create({
          provider: 'local',
          name: 'Test User',
          email: process.env.EMAIL_USER_TEST || 'test@example.com',
          password: process.env.PASSWORD_TEST || 'test'
        }, {
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: process.env.EMAIL_USER_ADMIN || 'admin@example.com',
          password: process.env.PASSWORD_ADMIN || 'admin'
        })
        .then(() => logger.info('finished populating users'))
        .catch(err => logger.error('error populating users - %s', err));
      });
  }else{
    logger.info('Finding local admin user');
    User.find({name: 'Admin'}).then((user) => {
      if(!user.length){
        logger.info('Admin user not found, creating local admin user');
        User.create({
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: process.env.EMAIL_USER_ADMIN || 'admin@example.com',
          password: process.env.PASSWORD_ADMIN || 'admin'
        })
          .then(() => logger.info('finished populating users'))
          .catch(err => logger.error('error populating users - %s', err));
      }else{
        console.log("Admin user =" + JSON.stringify(user));
        logger.info('Admin user already exists.');
      }
    });

  }
}
