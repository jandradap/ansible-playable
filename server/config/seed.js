/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    User.find({}).remove()
      .then(() => {
        User.create({
          provider: 'local',
          name: 'Test User',
          email: 'test@playable.com',
          password: process.env.PASSWORD_TEST || 'test'
        }, {
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: 'admin@playable.com',
          password: process.env.PASSWORD_ADMIN || 'admin'
        })
        .then(() => console.log('finished populating users'))
        .catch(err => console.log('error populating users', err));
      });
  }
}
