const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Bike schema
const bikeSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    name: { type: String, required: true },     // the name of this bike
    gearId: String,                             // external provider id of bike
    description: String,                        // description of the bike
    manufacturer: String,                       // manufacturer of bike
    model: String,                              // the manufacturer's model name
    default: Boolean,                           // flag indicating default bike
});

const Bike = mongoose.model('Bike', bikeSchema);

module.exports = Bike;