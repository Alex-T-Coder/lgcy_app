const cleanPhoneNumbers = (phoneNumbers) => {
  if (Array.isArray(phoneNumbers)) {
    return phoneNumbers.map((number) => number.replace(/\D/g, ''));
  } else {
    return phoneNumbers.replace(/\D/g, '');
  }
};

module.exports = {
  cleanPhoneNumbers,
};
