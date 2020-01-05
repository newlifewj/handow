// Needn't install 'events' pacakge specifically, it was included in webpack or Babel.
// Otherwise we need install it by npm. https://www.npmjs.com/package/events
import EventEmitter from 'events';

class EventBus extends EventEmitter {
    constructor(maxListener) {
        super();
        // Define all Events here for easy reference and prompt in IDE
        this.labels = {
            spinnerUpdate: "SPINNER_UPDATE",
            headUpdate: "HEAD_UPDATE",
            viewUpdate: "VIEW_UPDATE"
        };
        this.setMaxListeners(maxListener);
    }
}

export default new EventBus(200);