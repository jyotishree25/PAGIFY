import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import BookhubLanding from "./pages/landing/landing";




// ===== Seller Pages =====
import SellerDashboard from "./pages/seller/sellerDashboard";
import SellerLogin from "./pages/seller/sellerLogin";
import SellerSignup from "./pages/seller/sellerSignup";
import AddBook from "./pages/seller/addBook";
import ManageBook from "./pages/seller/manageBook";
import SellerOrder from "./pages/seller/sellerOrder";

// ===== Admin Pages =====
import PagifyLanding from "./pages/landing/landing";
import AdminDashboard from "./pages/admin/adminDashboard.jsx";
import OrderManagement from "./pages/admin/orderManagement.jsx";
import UpdateOrder from "./pages/admin/updateOrder.jsx";
import ProductManagement from "./pages/admin/productManagement.jsx";
import ProductEdit from "./pages/admin/productEdit.jsx";
import AddProduct from "./pages/admin/addProduct.jsx";
import UserManagement from "./pages/admin/userManagement.jsx";
import PremiumUserManagement from "./pages/admin/premiumUserManagement.jsx";
import GeneralUserManagement from "./pages/admin/generalUserManagement.jsx";
import AdminLogin from "./pages/admin/adminLogin.jsx";
import Settings from "./pages/admin/settings.jsx";
import DiscountManagement from "./pages/admin/discountManagement.jsx";
import DiscountEdit from "./pages/admin/discountEdit.jsx";
import Reviews from "./pages/admin/review.jsx";
import SellerManagement from "./pages/admin/sellerManagement.jsx";

// ===== User Pages =====
import HomePage from "./pages/user/home.jsx";
import HomePage1 from "./pages/user/home1.jsx";
import UserSignup from "./pages/user/userSignup.jsx"; 
import UserLogin from "./pages/user/userLogin.jsx";
import Order from "./pages/user/order.jsx";
import Wishlist from "./pages/user/wishlist.jsx";
import ProductDetails from "./pages/user/productDetails.jsx";
import Category from "./pages/user/category.jsx";
import Cart from "./pages/user/cart.jsx";
import Invoice from "./pages/user/invoice.jsx";
import OrderSummary from "./pages/user/orderSummary.jsx";
import EmailAddressPayment from "./pages/user/emailAddressPayment.jsx";
import UserSettings from "./pages/user/userSettings.jsx";


function AdminDashboardWrapper() {
  const navigate = useNavigate();

  return (
    <AdminDashboard
      onGoToProducts={() => navigate("/admin/product-management")}
      onGoToUsers={() => navigate("/admin/user-management")}
      onGoToOrders={() => navigate("/admin/order-management")}
    />
  );
}
function ProductManagementWrapper() {
  const navigate = useNavigate();

  return (
    <ProductManagement
      onBack={() => navigate("/admin/dashboard")}
      darkMode={false}
    />
  );
}




function AppMain() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<BookhubLanding />} />
      <Route path="/" element={<BookhubLanding />} />
      {/* Seller Routes */}
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route path="/seller/signup" element={<SellerSignup />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/add-book" element={<AddBook />} />
      <Route path="/seller/manage-book/:productId" element={<ManageBook />} />

      <Route path="/seller/order/:id" element={<SellerOrder />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboardWrapper />}/>

      <Route path="/admin/order-management" element={<OrderManagement />} />      
      <Route path="/admin/update-order" element={<UpdateOrder />} />
      <Route path="/admin/product-management" element={<ProductManagementWrapper />}/>
      <Route path="/admin/add-product" element={<AddProduct />}/>

      
      
      <Route path="/admin/products/edit/:productId" element={<ProductEdit />}/>

      <Route path="/admin/user-management" element={<UserManagement />} />
      <Route path="/admin/premium-user-management" element={<PremiumUserManagement />} />
      <Route path="/admin/general-user-management" element={<GeneralUserManagement />} />
      <Route path="/admin/seller-management" element={<SellerManagement />} />
      <Route path="/admin/settings" element={<Settings />} />
      <Route path="/admin/discounts" element={<DiscountManagement />} />
      <Route path="/admin/discount-edit" element={<DiscountEdit />} />
      <Route path="/admin/reviews" element={<Reviews />} />

      {/* User Routes */}
      <Route path="/user/home" element={<HomePage />} />
      <Route path="/user/home1" element={<HomePage1 />} />
      <Route path="/user/signup" element={<UserSignup />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/orders" element={<Order />} />
      <Route path="/user/wishlist" element={<Wishlist />} />
      <Route path="/user/product/:productId" element={<ProductDetails />} />



      <Route path="/user/category" element={<Category />} />
      <Route path="/user/cart" element={<Cart />} />
      <Route path="/user/invoice" element={<Invoice />} />
      <Route path="/user/ordersummary" element={<OrderSummary />} />
      <Route path="/user/emailaddresspayment" element={<EmailAddressPayment />} />
      <Route path="/user/settings" element={<UserSettings />} />
    </Routes>
  );
}

export default AppMain;
