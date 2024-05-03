const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Component schema stores information about a specific bike component
const componentSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    category: { type: String, required: true }, // category (wheel, chain, brake, etc...)
    name: { type: String, required: true },     // the name of this component
    description: String,                        // description of the component
    manufacturer: String,                       // manufacturer of component
    model: String,                              // the manufacturer's model name

    isActive: Boolean,                          // flag indicating if component is installed
    installDate: Date,                          // timestamp of time component was installed UTC
    totalDistance: Number,                      // total accumulated distance in meters
    totalTime: Number,                          // total accumulated moving time in seconds
});

const Component = mongoose.model('Component', componentSchema);

module.exports = Component;
