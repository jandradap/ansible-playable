'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './project.events';

var ProjectSchema = new mongoose.Schema({
  name: String,
  ansibleEngine: {},
  ansibleVersion : String,
  creationTime: Date,
  info: String,
  active: Boolean,
  ansible_data: String, //YAML Format
  ansible_data_json: {}, //JSON Format
  inventory_data: String, //YAML Format
  inventory_data_json: {}, //JSON Format
  roles_data: String, //YAML Format
  roles_data_json: {} //JSON Format
});

registerEvents(ProjectSchema);
export default mongoose.model('Project', ProjectSchema);
