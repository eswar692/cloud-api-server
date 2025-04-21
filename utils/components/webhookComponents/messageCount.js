const Api = require("../../../Model/Api");


const messageCount = async (data) => {
    const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
    if (!message) return;
    const messageTimeStamp = new Date(parseInt(message?.timestamp, 10) * 1000).toISOString();
    console.log("message time stamp", messageTimeStamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); 
    

}
