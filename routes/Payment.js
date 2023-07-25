const express = require("express");
const router = express.Router();

const {
  processPayments,
  getstripeapikey,
} = require("../controllers/PaymentController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/payment/process").post(isAuthenticatedUser, processPayments);
router.route("/stripeapikey").get(isAuthenticatedUser, getstripeapikey);

module.exports = router;
