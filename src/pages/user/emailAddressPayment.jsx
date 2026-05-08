import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ArrowLeft, CreditCard, DollarSign, Edit3 } from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

// --- Shared Utility Function (to replace window.alert) ---
const customAlert = (message, isSuccess = true) => {
    const statusDiv = document.getElementById('status-message');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `fixed top-0 left-0 right-0 mx-auto w-fit p-3 border rounded-lg shadow-xl hidden mt-4 z-50 transition-all duration-300 ${
            isSuccess ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-red-100 border-red-500 text-red-800'
        }`;
        statusDiv.classList.remove('hidden');
        statusDiv.classList.add('block');
        setTimeout(() => {
            statusDiv.classList.add('hidden');
            statusDiv.classList.remove('block');
        }, 3000);
    } else {
        console.log("Status message:", message);
    }
};

// --- Sub-Component: FormField (Reused from previous version) ---
const FormField = ({ label, name, type = 'text', value, onChange, optional = false, options = [], selectIconClass = '' }) => {
  const inputClasses = "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150 ease-in-out text-sm shadow-sm";
  
  if (type !== 'select') {
    return (
      <input
        className={inputClasses}
        type={type}
        name={name}
        placeholder={optional ? `${label} (Optional)` : label}
        value={value}
        onChange={onChange}
        aria-label={label}
      />
    );
  }

  return (
    <div className="relative">
      <select
        className={`${inputClasses} appearance-none cursor-pointer pr-10 bg-white`}
        name={name}
        value={value}
        onChange={onChange}
        aria-label={label}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${selectIconClass}`}>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};


// --- Sub-Component: AddressForm (The "DELIVER TO" page) ---

/**
 * @param {object} props
 * @param {object} props.initialData - Current shipping details
 * @param {function} props.onConfirm - Callback to save data and go to checkout
 * @param {function} props.onCancel - Callback to go back to checkout without saving
 */
const AddressForm = ({ initialData, onConfirm, onCancel }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to create a single display address string
    const displayAddress = `${formData.street}, ${formData.city}, ${formData.stateProvince}, ${formData.zipCode}, ${formData.country}`;
    onConfirm({ ...formData, displayAddress });
  };

  // Static options for dropdowns, updated for India
  const titleOptions = [{ value: 'Mr', label: 'Mr' }, { value: 'Ms', label: 'Ms' }, { value: 'Dr', label: 'Dr' }];
  const stateOptions = [{ value: 'Delhi', label: 'Delhi' }, { value: 'Maharashtra', label: 'Maharashtra' }, { value: 'Karnataka', label: 'Karnataka' }];
  const countryOptions = [{ value: 'India', label: 'India' }, { value: 'US', label: 'United States' }];
  const phoneCodeOptions = [{ value: '+91 (IN)', label: '+91 (IN)' }, { value: '+1 (US)', label: '+1 (US)' }, { value: '+44 (UK)', label: '+44 (UK)' }];

  return (
    <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-xl shadow-2xl transition-all duration-300">
        
        {/* Header (Back Button, Title, and Close Button) */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
                {/* Back Button -> Navigates to PaymentCheckout (onCancel) */}
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-800 transition duration-150 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Go back to checkout"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-gray-800">
                    DELIVER TO
                </h1>
            </div>

            {/* Close Button */}
          <button
            onClick={onCancel} // Close action defaults to going back to checkout
            className="text-gray-500 hover:text-gray-800 transition duration-150 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close form"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Form Fields */}
            <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            <FormField type="select" label="Title" name="title" value={formData.title} onChange={handleChange} options={titleOptions} />
            <FormField label="Company" name="company" value={formData.company} onChange={handleChange} />
            <FormField label="Street Address" name="street" value={formData.street} onChange={handleChange} />
            <FormField label="Address Information" name="addressInfo" value={formData.addressInfo} onChange={handleChange} optional={true} />
            <FormField label="City" name="city" value={formData.city} onChange={handleChange} />
            <FormField label="Pin Code" name="zipCode" value={formData.zipCode} onChange={handleChange} type="number" />
            <FormField type="select" label="State/Province" name="stateProvince" value={formData.stateProvince} onChange={handleChange} options={stateOptions} />
            <FormField type="select" label="Country" name="country" value={formData.country} onChange={handleChange} options={countryOptions} />

            {/* Phone Number (Split Field) */}
            <div className="grid grid-cols-5 gap-4 col-span-1 md:col-span-2">
                <div className="col-span-2">
                    <FormField type="select" label="Phone Code" name="phoneCode" value={formData.phoneCode} onChange={handleChange} options={phoneCodeOptions} selectIconClass="pr-0" />
                </div>
                <div className="col-span-3">
                    <FormField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} type="tel" />
                </div>
            </div>

          </div>

          {/* Confirm Button (Emerald Color) */}
          <button
            type="submit"
            className="w-full py-4 mt-6 bg-emerald-600 text-white font-bold tracking-widest uppercase rounded-md shadow-lg
                       hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50
                       transition duration-200 ease-in-out text-sm sm:text-base"
          >
            CONFIRM
          </button>
        </form>
    </div>
  );
};

// --- Sub-Component: PaymentCheckout (The user's provided page logic) ---

/**
 * @param {object} props
 * @param {object} props.shippingDetails - Current shipping details to display
 * @param {function} props.onEditAddress - Callback to switch to address edit view
 * @param {object} props.user - Current user details
 * @param {object} props.product - Selected product details
 * @param {number} props.quantity - Selected quantity
 * @param {number} props.total - Calculated total amount
 */
const PaymentCheckout = ({ shippingDetails, onEditAddress, user, product, quantity, total }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirm = () => {
    const methodLabel = paymentMethod === 'card' ? 'Card' : paymentMethod === 'netbanking' ? 'Netbanking' : 'Cash on Delivery'
    customAlert(`Order placed via ${methodLabel}. Amount ₹${(total || 0).toFixed(2)}`, true)
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Checkout</h2>

      {/* User details */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Your details</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="border rounded-lg p-3 bg-gray-50">
            <p><strong>Name:</strong> {user?.name || '—'}</p>
            <p><strong>Email:</strong> {user?.email || '—'}</p>
          </div>
          <div className="border rounded-lg p-3 bg-gray-50">
            <p><strong>Phone:</strong> {user?.phone || '—'}</p>
            <p><strong>Address:</strong> {user?.address || shippingDetails?.displayAddress || '—'}</p>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium">Shipping address</label>
          <button
            onClick={onEditAddress}
            className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm transition-all"
          >
            <Edit3 className="h-4 w-4 mr-1" /> Edit
          </button>
        </div>
        <div className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-sm text-gray-700 font-medium">
          {shippingDetails.displayAddress || 'Please set your shipping address.'}
        </div>
      </div>

      {/* Product summary */}
      {product && (
        <div className="mb-5 border rounded-lg p-3 bg-gray-50 text-sm">
          <div className="flex items-center gap-3">
            {product.coverImage && (
              <img src={product.coverImage} alt={product.title} className="w-16 h-20 object-cover rounded" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{product.title}</p>
              <p className="text-gray-600">Qty: {quantity || 1}</p>
              <p className="text-gray-800 font-medium">Price: ₹{Number(product.price || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment options */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Payment information</label>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 flex items-center justify-center border rounded-lg py-2 transition-all text-sm ${paymentMethod === 'card' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400'}`}
          >
            <CreditCard className="h-4 w-4 mr-2" /> Card
          </button>
          <button
            onClick={() => setPaymentMethod('netbanking')}
            className={`flex-1 flex items-center justify-center border rounded-lg py-2 transition-all text-sm ${paymentMethod === 'netbanking' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400'}`}
          >
            <DollarSign className="h-4 w-4 mr-2" /> Netbanking
          </button>
          <button
            onClick={() => setPaymentMethod('cod')}
            className={`flex-1 flex items-center justify-center border rounded-lg py-2 transition-all text-sm ${paymentMethod === 'cod' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400'}`}
          >
            Cash on Delivery
          </button>
        </div>
      </div>

      {/* Card details */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name on card</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Card number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="XXXX XXXX XXXX XXXX"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiration</label>
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="XXX"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Netbanking details */}
      {paymentMethod === 'netbanking' && (
        <div className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">Use your saved bank details or update them in settings.</p>
          <div className="border rounded-lg p-3 bg-gray-50">
            <p><strong>Bank Account:</strong> {user?.bankAccount || '—'}</p>
            <p><strong>IFSC Code:</strong> {user?.ifscCode || '—'}</p>
          </div>
        </div>
      )}

      {/* Cash on Delivery details */}
      {paymentMethod === 'cod' && (
        <div className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">Pay in cash upon delivery. Please ensure your phone is reachable for delivery confirmation.</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={onEditAddress}
          className="flex items-center text-emerald-700 hover:text-emerald-800 hover:underline transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
        <button
          onClick={handleConfirm}
          className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-2 hover:bg-emerald-700 active:bg-emerald-800 shadow-md hover:shadow-lg transition-all"
        >
          {paymentMethod === 'cod' ? `Place Order (COD) ₹${(total || 0).toFixed(2)}` : `Confirm Payment ₹${(total || 0).toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

// --- Main Application Component (Router) ---
export default function App() {
    const initialAddress = {
        firstName: 'Anil',
        lastName: 'Sharma',
        title: 'Mr',
        company: 'Tech Solutions Pvt Ltd',
        street: '21, Nehru Place',
        addressInfo: 'Near Metro Station',
        city: 'New Delhi',
        zipCode: '110019',
        stateProvince: 'Delhi',
        country: 'India',
        phoneCode: '+91 (IN)',
        phoneNumber: '98765 43210',
        displayAddress: '21, Nehru Place, New Delhi, Delhi, 110019, India',
    };

    // Read productId and quantity passed via navigate state from ProductDetails
    const location = useLocation();
    const { productId, quantity: navQty } = location.state || {};

    const API = 'http://localhost:8000/api/v1';

    const [currentView, setCurrentView] = useState('checkout'); // 'checkout' or 'address_edit'
    const [shippingDetails, setShippingDetails] = useState(initialAddress);

    const [user, setUser] = useState(null);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(navQty || 1);
    const [total, setTotal] = useState(0);

    // Ensure status message placeholder exists
    useEffect(() => {
        if (!document.getElementById('status-message')) {
            const div = document.createElement('div');
            div.id = 'status-message';
            document.body.appendChild(div);
        }
    }, []);

    // Load current user (if token present)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser({});
            return;
        }
        axios
            .get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                setUser(res.data?.user || {});
            })
            .catch(() => setUser({}));
    }, []);

    // Load selected product
    useEffect(() => {
        if (!productId) return;
        axios
            .get(`${API}/products/${productId}`)
            .then((res) => {
                const p = res.data?.product || res.data || null;
                setProduct(p);
            })
            .catch(() => setProduct(null));
    }, [productId]);

    // Compute total whenever product/quantity changes
    useEffect(() => {
        const price = Number(product?.price || 0);
        setTotal(price * (quantity || 1));
    }, [product, quantity]);

    const handleAddressSave = (newDetails) => {
        setShippingDetails(newDetails);
        setCurrentView('checkout');
        customAlert('Address updated successfully!', true);
    };

    const handleEditAddress = () => {
        setCurrentView('address_edit');
    };

    const missingProduct = !productId && !product;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            {missingProduct ? (
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-4">No product selected</h2>
                    <p className="text-gray-600 mb-4">Please go back and choose Buy Now again.</p>
                    <button className="bg-emerald-600 text-white font-medium rounded-lg px-6 py-2 hover:bg-emerald-700 shadow-md" onClick={() => window.history.back()}>
                        Go Back
                    </button>
                </div>
            ) : currentView === 'checkout' ? (
                <PaymentCheckout
                    shippingDetails={shippingDetails}
                    onEditAddress={handleEditAddress}
                    user={user}
                    product={product}
                    quantity={quantity}
                    total={total}
                />
            ) : (
                <AddressForm
                    initialData={shippingDetails}
                    onConfirm={handleAddressSave}
                    onCancel={() => setCurrentView('checkout')}
                />
            )}
            {/* The status message div for customAlert */}
            <div id="status-message" className="fixed top-0 left-0 right-0 mx-auto w-fit p-3 bg-emerald-100 border border-emerald-500 text-emerald-800 rounded-lg shadow-xl hidden mt-4 z-50">
                Notification area.
            </div>
        </div>
    );
}
