const express = require("express");
const router = express.Router();
const {
  newOrder,
  getsingleOrder,
  myOrders,
  getallOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderControllers");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getsingleOrder);
router.route("/orders/myorders").get(isAuthenticatedUser, myOrders);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getallOrders);
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
