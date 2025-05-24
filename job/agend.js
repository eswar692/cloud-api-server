const Agenda = require("agenda");
require("dotenv").config();

const agenda = new Agenda({
  db: {
    address: process.env.mongo_url,
    collection: "agendaJobs",
  },
});

module.exports = agenda;
