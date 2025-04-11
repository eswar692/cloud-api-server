const Api = require("../.././../Model/Api");
const Contact = require("../.././../Model/Contact");
const { sendContacts } = require("../../socket");

const contactSet = async (data) => {
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;

  const contact = await Contact.findOne({
    phoneNumber: message?.from,
  });
  if (!contact) {
    if (!profileName || !message.from) return;
    const contact = await Contact.create({
      displayName: profileName,
      phoneNumber: message?.from,
      userApiNumber: apiNumber,
      whatsappUserTime: message?.timestamp,
    });

    const userApi = await Api.findOne({ phoneNumber: contact.userApiNumber });
    if (userApi) {
      const userId = userApi.userId.toString();
      await sendContacts(userId);
    }
  } else {
    contact.whatsappUserTime = message.timestamp; // update field
    const updatedContact = await contact.save(); // save the changes

    const userApi = await Api.findOne({
      phoneNumber: updatedContact.userApiNumber,
    });
    if (userApi) {
      const userId = userApi.userId.toString();
      await sendContacts(userId);
    }
  }
};

module.exports = { contactSet };
