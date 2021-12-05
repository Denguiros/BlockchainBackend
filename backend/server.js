const Koa = require("koa");
const Router = require("@koa/router");
const cors = require("@koa/cors");
const ethers = require("ethers");
const PaymentProcessor = require("C:/Users/Denguiros/source/repos/GameHeaven/wwwroot/js/src/contracts/PaymentProcessor.json");
const { Payment } = require("./db.js");

const app = new Koa();
const router = new Router();

//generate a paymentId for purchage
router.get("/api/getPaymentId/:paymentId", async (ctx, next) => {
  var ids = JSON.parse(ctx.query.ids);
  var paymentId = ctx.params.paymentId;
  var idsAsString = "";
  for (var i in ids) {
    idsAsString += i + " ";
  }
  console.log(idsAsString);
  //2. save paymentId + itemIds in mongo
  await Payment.create({
    id: paymentId,
    itemId: idsAsString,
    paid: false,
  });
  //3. return paymentId to sender
  ctx.body = {
    paymentId,
  };
});

//get the url to download an item purchased
router.get("/api/getApproval/:paymentId", async (ctx, next) => {
  //1. verify paymentId exist in db and has been paid
  const payment = await Payment.findOne({ id: ctx.params.paymentId });
  //2. return url to download item
  if (payment && payment.paid === true) {
    ctx.body = {
      approval: "true",
    };
  } else {
    ctx.body = {
      approval: "false",
    };
  }
});

app.use(cors()).use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("Server running on port 4000");
});

const listenToEvents = () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:9545"
  );
  const networkId = "5777";
  const paymentProcessor = new ethers.Contract(
    PaymentProcessor.networks[networkId].address,
    PaymentProcessor.abi,
    provider
  );
  paymentProcessor.on("PaymentDone", async (payer, amount, paymentId, date) => {
    console.log(`New payment received: 
      from ${payer} 
      amount ${amount.toString()} 
      paymentId ${paymentId} 
      date ${new Date(date.toNumber() * 1000).toLocaleString()}
    `);
    const payment = await Payment.findOne({ id: paymentId.toString() });
    if (payment) {
      payment.paid = true;
      await payment.save();
    }
  });
};
listenToEvents();
