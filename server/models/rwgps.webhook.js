const { sign } = require("crypto");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Rwgps Webhook Notification schema stores a single notification from RWGPS webhook
const RwgpsWebhookNotificationSchema = new Schema({
    rwgpsUserId: { type: Number, required: true },   // The RWGP user id
    itemType: String,
    itemId: Number,
    itemUrl: String,
    action: String,
    apiKey: String,
    signature: String,
    receivedAt: Date
});

const RwgpsWebhookNotification = mongoose.model('RwgpsWebhookNotification', RwgpsWebhookNotificationSchema);

// Create a notification from results of RWGPS Api 
RwgpsWebhookNotification.createFromRwgps = function(notification, apiKey, signature) {
    return notification ?  {
        rwgpsUserId: notification.user_id,
        itemType: notification.item_type,
        itemId: notification.item_id,
        itemUrl: notification.item_url,
        action: notification.action,
        apiKey: apiKey,
        signature: signature,
        receivedAt: new Date(Date.now())
    } : null;
}


module.exports = RwgpsWebhookNotification;