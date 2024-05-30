const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceIntervalSchema = new Schema({
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

    isInstalled: Boolean,                           // flag indicating if component is currently installed
    installDate: {type: Date, default: Date.now },  // timestamp of time component was installed UTC
    uninstallDate: { type: Date},                   // timestamp of time component was uninstalled UTC
    serviceIntervals: [serviceIntervalSchema],      // list of recommended service intervals

    totalRides: Number,                          // Total number of rides taken with component
    totalDistance: Number,                       // Total accumulated distance in meters
    totalTime: Number,                           // Total accumulated ride time in seconds
});

const Component = mongoose.model('Component', componentSchema);

module.exports = Component;
