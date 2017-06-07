/**
 * Project model events
 */

'use strict';

import {EventEmitter} from 'events';
var ProjectEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ProjectEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Project) {
  for(var e in events) {
    let event = events[e];
    Project.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    ProjectEvents.emit(event + ':' + doc._id, doc);
    ProjectEvents.emit(event, doc);
  };
}

export {registerEvents};
export default ProjectEvents;
