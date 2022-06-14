export const pubsub = {
    observers: {},

    subscribe: function (evName, fn) {
        this.observers[evName] = this.observers[evName] || [];
        this.observers[evName].push(fn);
    },

    unsubscribe: function (evName, fn) {
        if (this.observers) {
            this.observers[evName] = this.observers[evName].filter(f => f !== fn);
        }
    },

    publish: function (evName, data) {
        if (this.observers[evName]) {
            this.observers[evName].forEach(element => {
                element(data);
            });
        }
    }
} 
