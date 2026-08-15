const knex = require('../db');

async function audit(labId, userId, action, entity, entityId) {
  try {
    await knex('audit_logs').insert({
      lab_id: labId,
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
    });
  } catch (e) {
    console.error('[audit] failed to write log', e.message);
  }
}

// Stub notification sender. Swap the body of this function for a real
// provider (Twilio, Gupshup, MSG91, SendGrid, etc.) when you go live.
async function notify(labId, orderId, channel, message) {
  const status = 'sent_stub';
  console.log(`[notify:${channel}] lab=${labId} order=${orderId} :: ${message}`);
  await knex('notifications_log').insert({
    lab_id: labId,
    order_id: orderId,
    channel,
    status,
  });
  return status;
}

module.exports = { audit, notify };
