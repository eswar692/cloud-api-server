const Api = require('../.././../Model/Api');
const Contact = require('../.././../Model/Contact');
const { sendContacts } = require('../../socket');

const contactSet = async (data) => {
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;

  const contact = await Contact.findOne({
    phoneNumber: message?.from
  });
  if (!contact) {
    const timestamp = new Date(parseInt(message?.timestamp) * 1000);
    // if (!profileName || !message.from) return;
    const contact = await Contact.create({
      displayName: profileName,
      phoneNumber: message?.from,
      userApiNumber: apiNumber,
      whatsappUserTime: timestamp.toString(),
      lastMessage: {
        messageType: message?.type,
        textMessage: message?.text?.body || null,
        messageTimestamp: timestamp,
        messageCount: 1
      }
    });

    const userApi = await Api.findOne({ phoneNumber: contact.userApiNumber });
    if (userApi) {
      const userId = userApi.userId.toString();
      // await sendContacts(userId); socket emit edi
    }
  } else {
    const timestamp = new Date(parseInt(message?.timestamp) * 1000);
    contact.whatsappUserTime = timestamp.toString(); // update field
    contact.lastMessage = {
      displayName: profileName,
      messageType: message?.type,
      textMessage: message?.text?.body || null,
      messageTimestamp: timestamp,
      messageCount: (contact.lastMessage?.messageCount || 0) + 1
    };
    const updatedContact = await contact.save(); // save the changes

    const userApi = await Api.findOne({
      phoneNumber: updatedContact.userApiNumber
    });
    if (userApi) {
      const userId = userApi.userId.toString();
      // await sendContacts(userId);
    }
  }
};

module.exports = { contactSet };
