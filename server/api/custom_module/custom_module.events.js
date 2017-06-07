/**
 * CustomModule model events
 */

'use strict';

import {EventEmitter} from 'events';
var CustomModuleEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CustomModuleEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(CustomModule) {
  for(var e in events) {
    let event = events[e];
    CustomModule.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    CustomModuleEvents.emit(event + ':' + doc._id, doc);
    CustomModuleEvents.emit(event, doc);
  };
}

export {registerEvents};
export default CustomModuleEvents;
