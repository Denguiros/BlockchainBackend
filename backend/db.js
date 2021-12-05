const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://127.0.0.1:27017/BlockchainApp?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const paymentSchema = new mongoose.Schema({
  id: String,
  itemId: String,
  paid: Boolean,
});
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = {
  Payment,
};
