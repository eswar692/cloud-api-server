const Api = require('../../../Model/Api');
const Webhook = require('../../../Model/Webhook');
const Payment = require('../../../Model/Payment');

const PlanLimitCheck = async (data) => {
  console.log('messageCount function called ');
  try {
    // Check if data is present and extract message, whatsappUserPhoneNumber, and apiNumber
    const value = data?.entry[0]?.changes[0]?.value;
    const message = value?.messages[0];
    const whatsappUserPhoneNumber = message?.from;
    const apiNumber = value?.metadata?.display_phone_number;

    // Check if message, whatsappUserPhoneNumber, and apiNumber are present
    if (!message || !whatsappUserPhoneNumber || !apiNumber) return false;
    console.log(message, whatsappUserPhoneNumber, apiNumber);

    // Find the user by phone number
    const findUser = await Api.findOne({ phoneNumber: apiNumber }).select(
      'userId'
    );
    if (!findUser) return false;
    // Find the payment details for the user
    const payment = await Payment.findOne({ userId: findUser.userId });
    console.log('pookie');
    if (!payment) return false;
    // eppudu payment ni get and Api data get chesamu ante first webhook vachina next this function call avuthundi
    //so if tho condition check chestamu

    if (payment.messageCountTracker <= payment.messageLimit) {
      return true;
    } else {
      console.log('Message limit exceeded for user:', findUser.userId);
      return false; // Message limit exceeded
    }
  } catch (error) {
    console.error('Error in messageCount:', error);
    return false;
  }
};

module.exports = PlanLimitCheck;
