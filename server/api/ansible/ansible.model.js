'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './ansible.events';

var AnsibleSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean,
  logfile: String,
  tags: String,
  limit_to_hosts: String,
  host: String,
  verbose: String,
  check_mode: Boolean,
  selectedPlaybook: String,
  selectedPlay: String,
  executionType: String,
  executionName: String,
  executionTime: Date
});

registerEvents(AnsibleSchema);
export default mongoose.model('Ansible', AnsibleSchema);
