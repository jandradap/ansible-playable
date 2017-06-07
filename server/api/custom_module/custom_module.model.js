'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './custom_module.events';

var CustomModuleSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(CustomModuleSchema);
export default mongoose.model('CustomModule', CustomModuleSchema);
