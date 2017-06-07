/**
 * Ansible model events
 */

'use strict';

import {EventEmitter} from 'events';
var AnsibleEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
AnsibleEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Ansible) {
  for(var e in events) {
    let event = events[e];
    Ansible.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    AnsibleEvents.emit(event + ':' + doc._id, doc);
    AnsibleEvents.emit(event, doc);
  };
}

export {registerEvents};
export default AnsibleEvents;
