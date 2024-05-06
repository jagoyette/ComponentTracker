const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The ComponentEvent schema stores information about an event affecting
// an individual component. For example, a ride is an event that adds
// mileage and time to the component's lifetime
const componentEvent = new Schema({
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

// The Component schema stores information about a specific bike component
const componentSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    category: { type: String, required: true }, // category (wheel, chain, brake, etc...)
    name: { type: String, required: true },     // the name of this component
    description: String,                        // description of the component
    manufacturer: String,                       // manufacturer of component
    model: String,                              // the manufacturer's model name

    isActive: Boolean,                          // flag indicating if component is currently installed
    installDate: {type: Date, default: Date.now }, // timestamp of time component was installed UTC
    retireDate: { type: Date},                     // timestamp of time component was retired UTC
    history: [componentEvent]                   // history of events impacting this component
});

const Component = mongoose.model('Component', componentSchema);

module.exports = Component;
