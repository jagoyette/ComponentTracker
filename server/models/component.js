const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The ComponentEvent schema stores information about an event affecting
// an individual component. For example, a ride is an event that adds
// mileage and time to the component's lifetime
const componentEventSchema = new Schema({
    eventType: {            // Type of event
        type: String,
        enum: [
            'RIDE',
            'INITIAL',
            'MANUAL'
        ],
        default: 'RIDE',
        required: true
    },
    eventDate: {            // Timestamp of the event UTC
        type: Date,
        default: Date.now,
        required: true
    },
    description: String,    // Description of event
    rideId: String,         // Id of RIDE if eventType is RIDE
    distance: Number,       // total distance component was ridden in meters
    time: Number,           // total time of component usage in seconds
});

const componentServiceSchema = new Schema({
    name: { type: String, required: true },     // A name for this service recommendation
    distance: Number,                           // Min distance to trigger service in meters
    time: Number,                               // Min number of seconds to trigger service
    rides: Number,                              // Min number of rides to trigger service
    description: String,                        // Description of service action
});

// The Component schema stores information about a specific bike component
const componentSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    category: { type: String, required: true }, // category (wheel, chain, brake, etc...)
    name: { type: String, required: true },     // the name of this component
    description: String,                        // description of the component
    manufacturer: String,                       // manufacturer of component
    model: String,                              // the manufacturer's model name

    isInstalled: Boolean,                          // flag indicating if component is currently installed
    installDate: {type: Date, default: Date.now }, // timestamp of time component was installed UTC
    uninstallDate: { type: Date},               // timestamp of time component was uninstalled UTC
    eventHistory: [componentEventSchema],       // history of events (rides) impacting this component
    serviceIntervals: [componentServiceSchema], // list of recommended service intervals
});

const Component = mongoose.model('Component', componentSchema);

module.exports = Component;
