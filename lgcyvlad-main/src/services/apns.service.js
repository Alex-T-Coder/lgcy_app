const apn = require('apn');
const config = require('../config/config');

const sendNotification = async (title, body, payload, apnsToken) => {
  try {
    const options = {
      token: {
        key: config.apnsKey,
        keyId: config.apnsKeyID,
        teamId: config.apnsTeamId,
      },
      production: false,
    };
    const apnProvider = new apn.Provider(options);
    apnProvider.on('error', (err) => {
      console.log('APN Error:', err);
    }) 
    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 0;
    note.priority = 10;
    note.sound = 'ping.aiff';
    note.alert = title;
    note.body = body;
    note.payload = payload;
    note.contentAvailable = true;
    note.topic = 'com.lgcy.lgcy';
    const result = await apnProvider.send(note, apnsToken);
    return result;
  } catch(error) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification apn not connected!');
  }
};

module.exports = {
  sendNotification,
};
