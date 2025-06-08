const Api = require('../.././../Model/Api');
const Contact = require('../.././../Model/Contact');
const { sendContacts } = require('../../socket');

const contactSet = async (data) => {
  console.log('contact DB store function cal');
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;

  try {
    const contact = await Contact.findOne({
      phoneNumber: message?.from,
      userApiNumber: apiNumber
    });
    console.log('contact', contact);
    if (!contact) {
      console.log('contact not found');
      const contact = await Contact.create({
        displayName: profileName,
        phoneNumber: message?.from,
        userApiNumber: apiNumber,
        whatsappUserTime: message?.timestamp,
        lastMessage: {
          messageType: message?.type,
          textMessage: message?.text?.body || null,
          messageTimestamp: message?.timestamp,
          messageCount: 1
        }
      });
    } else {
      console.log('contact found');
      contact.displayName = profileName;
      contact.whatsappUserTime = message?.timestamp; // update field
      contact.lastMessage = {
        messageType: message?.type,
        textMessage: message?.text?.body || null,
        messageTimestamp: message?.timestamp,
        messageCount: (contact.lastMessage?.messageCount || 0) + 1
      };
      const updatedContact = await contact.save(); // save the changes
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { contactSet };
