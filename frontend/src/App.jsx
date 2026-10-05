import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop, { CategoryShop } from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Brands from './pages/Brands'
import Brand from './pages/Brand'
import Finder from './pages/Finder'
import Compare from './pages/Compare'
import NotFound from './pages/NotFound'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import AccountLayout from './pages/account/AccountLayout'
import Dashboard from './pages/account/Dashboard'
import Profile from './pages/account/Profile'
import Security from './pages/account/Security'
import Addresses from './pages/account/Addresses'
import Orders from './pages/account/Orders'
import OrderDetails from './pages/account/OrderDetails'
import BeautyEdit from './pages/beauty-edit/BeautyEdit'
import ArticlePage from './pages/beauty-edit/ArticlePage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminBrands from './pages/admin/Brands'
import AdminCategories from './pages/admin/Categories'
import AdminReviews from './pages/admin/Reviews'
import AdminCoupons from './pages/admin/Coupons'
import { RequireAuth, RequireAdmin } from './components/Guards'

export default function App() {
  return (<Routes>
    {/* public auth pages: no Layout so they have their own header */}
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/verify-email" element={<VerifyEmail/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/reset-password" element={<ResetPassword/>}/>

    {/* main site */}
    <Route element={<Layout/>}>
      <Route path="/" element={<Home/>}/>
      <Route path="/product/:id" element={<Product/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/wishlist" element={<Wishlist/>}/>
      <Route path="/compare" element={<Compare/>}/>
      <Route path="/brands" element={<Brands/>}/>
      <Route path="/brands/:slug" element={<Brand/>}/>
      <Route path="/beauty-finder" element={<Finder/>}/>
      <Route path="/beauty-edit" element={<BeautyEdit/>}/>
      <Route path="/beauty-edit/:slug" element={<ArticlePage/>}/>
      <Route path="/checkout" element={<Checkout/>}/>
      <Route path="/order-success/:id" element={<OrderSuccess/>}/>
      {['makeup','skincare','haircare','fragrance','new-arrivals','best-sellers'].map(c => <Route key={c} path={`/${c}`} element={<Shop cat={c}/>}/>)}
      <Route path="/search" element={<Shop cat="search"/>}/>
      <Route path="/shop" element={<Shop cat="shop"/>}/>
      <Route path="/category/:slug" element={<CategoryShop/>}/>

      {/* account (requires auth) */}
      <Route path="/account" element={<RequireAuth><AccountLayout/></RequireAuth>}>
        <Route index element={<Dashboard/>}/>
        <Route path="profile" element={<Profile/>}/>
        <Route path="security" element={<Security/>}/>
        <Route path="addresses" element={<Addresses/>}/>
        <Route path="orders" element={<Orders/>}/>
        <Route path="orders/:id" element={<OrderDetails/>}/>
      </Route>

      <Route path="*" element={<NotFound/>}/>
    </Route>

    {/* admin (requires admin role) — its own frame */}
    <Route path="/admin" element={<RequireAdmin><AdminLayout/></RequireAdmin>}>
      <Route index element={<AdminDashboard/>}/>
      <Route path="products" element={<AdminProducts/>}/>
      <Route path="orders" element={<AdminOrders/>}/>
      <Route path="orders/:id" element={<AdminOrders/>}/>
      <Route path="users" element={<AdminUsers/>}/>
      <Route path="brands" element={<AdminBrands/>}/>
      <Route path="categories" element={<AdminCategories/>}/>
      <Route path="reviews" element={<AdminReviews/>}/>
      <Route path="coupons" element={<AdminCoupons/>}/>
    </Route>
  </Routes>)
}
