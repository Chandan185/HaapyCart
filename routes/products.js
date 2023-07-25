const express = require("express");
const router = express.Router();

const {
  getproducts,
  newproduct,
  getsingleproduct,
  updateProduct,
  deleteProduct,
  createReview,
  getProductreviews,
  deleteReview,
  getAdminProducts,
} = require("../controllers/productController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
router.route("/products").get(getproducts);
router.route("/product/:id").get(getsingleproduct);
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newproduct);
router.route("/admin/products").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminProducts);
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.route("/review").post(isAuthenticatedUser, createReview);
router.route("/reviews").get(getProductreviews);
router.route("/review/delete").delete(isAuthenticatedUser, deleteReview);
module.exports = router;
