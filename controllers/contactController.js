const Contact = require('../Model/Contact');
const Api = require('../Model/Api');
const User = require('../Model/User');
const Webhook = require('../Model/Webhook');

const getContacts = async (req, res) => {
  const page = req.query.page || 1;
  const limit = 100;
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }
    //find userId
    const user = await Api.findOne({ userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    //find contacts by User Api Number
    const contacts = await Contact.find({
      userApiNumber: user.phoneNumber
    })
      .sort({ whatsappUserTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (!contacts || contacts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No contacts found' });
    }
    return res.status(200).json({ success: true, message: 'contsc', contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateContactNewMessageSeen = async (req, res) => {
  try {
    const { userId } = req;
    const { whatsappUserNumber } = req.body;
    if (!userId || !whatsappUserNumber) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }
    const findUser = await Api.findOne({ userId });
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const contact = await Contact.findOneAndUpdate(
      { userApiNumber: findUser.phoneNumber, phoneNumber: whatsappUserNumber },
      {
        $set: {
          'lastMessage.messageSeen': false,
          'lastMessage.messageCount': 0
        }
      },
      { new: true } // return updated document
    );

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: 'Contact not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Contact updated successfully' });
  } catch (error) {
    return res.json(500).json({ success: false, message: error.message });
  }
};

const deleteContactsWithSelected = async (req, res) => {
  const userId = req.userId;
  const { phoneNumbers } = req.body;

  // 1. Check for required input
  if (
    !userId ||
    !phoneNumbers ||
    !Array.isArray(phoneNumbers) ||
    phoneNumbers.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'UserID and phoneNumbers (as a non-empty array) are required'
    });
  }

  try {
    // 2. Find the user
    const findUser = await Api.findOne({ userId });
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const userApiNumber = findUser.phoneNumber;

    // 3. Delete contacts
    const deleteContacts = await Contact.deleteMany({
      phoneNumber: { $in: phoneNumbers },
      userApiNumber: userApiNumber
    });

    // 4. Delete messages where user is sender or receiver with those phone numbers
    const deleteMessages = await Webhook.deleteMany({
      $or: [
        {
          sender: { $in: phoneNumbers },
          receiver: userApiNumber
        },
        {
          sender: userApiNumber,
          receiver: { $in: phoneNumbers }
        }
      ]
    });

    // 5. Return status with deleted counts (optional but helpful for frontend)
    return res.status(200).json({
      success: true,
      message: 'Contacts and messages deleted successfully',
      deletedContacts: deleteContacts.deletedCount,
      deletedMessages: deleteMessages.deletedCount
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

const deleteAllExceptSelectedMessages = async (req, res) => {
  const userId = req.userId;
  const { phoneNumbers } = req.body;

  if (!userId || !Array.isArray(phoneNumbers)) {
    return res
      .status(400)
      .json({
        success: false,
        message: 'User ID and phoneNumbers are required'
      });
  }

  try {
    const user = await Api.findOne({ userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Step 1: Get all contact phone numbers for this user
    const allContacts = await Contact.find({
      userApiNumber: user.phoneNumber
    });
    const allNumbers = allContacts.map((contact) => contact.phoneNumber);

    // Step 2: Filter out excluded numbers
    const numbersToDelete = allNumbers.filter(
      (num) => !phoneNumbers.includes(num)
    );

    if (numbersToDelete.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: 'No contacts to delete messages for' });
    }

    const deleteContacts = await Contact.deleteMany({
      phoneNumber: { $in: numbersToDelete },
      userApiNumber: user.phoneNumber
    });

    // Step 3: Delete Webhook messages where:
    // (sender is in numbersToDelete and receiver is user) OR (sender is user and receiver in numbersToDelete)
    await Webhook.deleteMany({
      $or: [
        { sender: { $in: numbersToDelete }, receiver: user.phoneNumber },
        { sender: user.phoneNumber, receiver: { $in: numbersToDelete } }
      ]
    });

    return res
      .status(200)
      .json({ success: true, message: 'Messages deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getContacts,
  updateContactNewMessageSeen,
  deleteContactsWithSelected,
  deleteAllExceptSelectedMessages
};
