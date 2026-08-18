import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
  HiOutlineXMark,
  HiOutlineReceiptPercent,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormSelect from '../../components/FormSelect';
import { saleApi } from '../../api/saleApi';
import { useBusiness } from '../../context/BusinessContext';
import { productApi } from '../../api/productApi';
import { customerApi } from '../../api/customerApi';
import { categoryApi } from '../../api/categoryApi';
import { formatCurrency, PAYMENT_METHODS } from '../../utils/helpers';
import useDebounce from '../../hooks/useDebounce';

const DEFAULT_TAX_RATE = 18;

function POS() {
  const { business } = useBusiness();

  // Product browser state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);

  // Customer state
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [notes, setNotes] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Load products
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const params = { limit: 100, status: 'active' };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.categoryId = selectedCategory;
      const res = await productApi.getAll(params);
      const data = res.data?.data || res.data || [];
      setProducts(Array.isArray(data) ? data : data.items || data.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        const cats = res.data?.data || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await customerApi.getAll({ limit: 50 });
        const custs = res.data?.data || res.data || [];
        setCustomers(Array.isArray(custs) ? custs : custs.items || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
  }, []);

  // Load products when search or category changes
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // --- Cart Logic ---

  const addToCart = useCallback((product) => {
    if (!product.stock || product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Maximum stock reached for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.sellingPrice,
          quantity: 1,
          taxRate: product.taxRate || DEFAULT_TAX_RATE,
          maximumStock: product.stock,
          image: product.image,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maximumStock) {
            toast.error(`Maximum stock reached for ${item.productName}`);
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountValue('');
    setNotes('');
    setPaymentMethod('cash');
    setSelectedCustomer('');
  }, []);

  // --- Calculations ---

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (!discountValue || Number(discountValue) <= 0) return 0;
    if (discountType === 'percentage') {
      return (subtotal * Math.min(Number(discountValue), 100)) / 100;
    }
    return Math.min(Number(discountValue), subtotal);
  }, [subtotal, discountValue, discountType]);

  const taxableAmount = subtotal - discountAmount;

  const taxAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + (item.unitPrice * item.quantity * (item.taxRate || 0)) / 100,
        0
      ),
    [cart]
  );

  const grandTotal = Math.max(0, taxableAmount + taxAmount);

  const amountPaid = useMemo(() => {
    // Default: full payment
    return grandTotal;
  }, [grandTotal]);

  const amountDue = grandTotal - amountPaid;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Complete Sale ---

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discount: 0,
          total: item.unitPrice * item.quantity,
        })),
        customerId: selectedCustomer || null,
        paymentMethod,
        amountPaid,
        discount: discountAmount,
        discountType,
        tax: taxAmount,
        subtotal,
        total: grandTotal,
        notes: notes.trim() || undefined,
      };
      const res = await saleApi.create(saleData);
      const result = res.data?.data || res.data;
      setCompletedSale(result);
      setShowSuccessModal(true);
      toast.success('Sale completed successfully!');
    } catch (err) {
      console.error('Failed to complete sale:', err);
      toast.error(err.response?.data?.message || 'Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSale = () => {
    setShowSuccessModal(false);
    setCompletedSale(null);
    clearCart();
  };

  // Filtered customers for search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, customerSearch]);

  // Filtered products (client-side for instant response)
  const displayedProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(
      (p) =>
        p.categoryId === selectedCategory ||
        p.category?.id === selectedCategory ||
        p.category === selectedCategory
    );
  }, [products, selectedCategory]);

  // Stock color helper
  const getStockColor = (stock) => {
    if (!stock || stock <= 0) return 'text-red-600 bg-red-50';
    if (stock <= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-5rem)]">
      {/* Split layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left Side - Product Browser (60%) */}
        <div className="lg:w-[60%] flex flex-col min-h-0">
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name, SKU, or barcode..."
                  className="w-full pl-11 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    !selectedCategory
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {productsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <LoadingSpinner type="page" />
                </div>
              ) : displayedProducts.length === 0 ? (
                <EmptyState
                  icon={<HiOutlineShoppingCart className="w-16 h-16" />}
                  title="No products found"
                  description={
                    search
                      ? `No results for "${search}". Try a different search.`
                      : 'No active products available. Add products first.'
                  }
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {displayedProducts.map((product) => {
                    const isOutOfStock = !product.stock || product.stock <= 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => !isOutOfStock && addToCart(product)}
                        disabled={isOutOfStock}
                        className={`text-left rounded-xl border p-3 transition-all duration-150 cursor-pointer ${
                          isOutOfStock
                            ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md active:scale-[0.98]'
                        }`}
                      >
                        {/* Image placeholder */}
                        <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2.5 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <HiOutlineShoppingCart className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-base font-bold text-gray-900 mt-0.5">
                          {formatCurrency(product.sellingPrice)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1.5 ${getStockColor(
                            product.stock
                          )}`}
                        >
                          {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Cart (40%) */}
        <div className="lg:w-[40%] flex flex-col min-h-0">
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0">
            {/* Cart Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HiOutlineShoppingCart className="w-5 h-5 text-gray-700" />
                <h2 className="text-base font-semibold text-gray-900">Cart</h2>
                {cartItemCount > 0 && (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {cart.length === 0 ? (
                <EmptyState
                  icon={<HiOutlineShoppingCart className="w-14 h-14" />}
                  title="Cart is empty"
                  description="Click on products to add them to the cart"
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="px-4 py-3 flex items-start gap-3"
                    >
                      {/* Item image or placeholder */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs font-medium">
                            {item.productName?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatCurrency(item.unitPrice)} each
                        </p>

                        {/* Quantity controls + remove */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
                            >
                              <HiOutlineMinus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              disabled={item.quantity >= item.maximumStock}
                              className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                item.quantity >= item.maximumStock
                                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                  : 'border-gray-300 text-gray-500 hover:bg-gray-100 active:bg-gray-200'
                              }`}
                            >
                              <HiOutlinePlus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <HiOutlineXMark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary - Fixed at bottom */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200">
                {/* Discount */}
                <div className="px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">Discount:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDiscountType('percentage')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          discountType === 'percentage'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        %
                      </button>
                      <button
                        onClick={() => setDiscountType('flat')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          discountType === 'flat'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Flat
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? '100' : String(subtotal)}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'percentage' ? '0' : formatCurrency(0).replace('₹', '')}
                      className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {discountAmount > 0 && (
                      <span className="text-xs text-red-500 font-medium ml-1">
                        -{formatCurrency(discountAmount)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="px-4 py-2 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-700 font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-red-500 font-medium">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-700 font-medium">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold pt-1.5 border-t border-gray-100">
                    <span className="text-gray-900">Grand Total</span>
                    <span className="text-gray-900">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="px-4 pt-3 pb-2 border-t border-gray-100 space-y-3">
                  {/* Customer Select */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Customer
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        onFocus={() => setCustomerSearch('')}
                        placeholder="Walk-in Customer"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                      />
                      {customerSearch !== undefined && (
                        <select
                          value={selectedCustomer}
                          onChange={(e) => {
                            setSelectedCustomer(e.target.value);
                            const found = customers.find(
                              (c) => c.id === e.target.value
                            );
                            if (found) setCustomerSearch(found.name || found.phone || '');
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                          <option value="">Walk-in Customer</option>
                          {filteredCustomers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}{c.phone ? ` (${c.phone})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {selectedCustomer && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {customers.find((c) => c.id === selectedCustomer)?.name ||
                          'Customer selected'}
                      </p>
                    )}
                  </div>

                  {/* Payment Method Buttons */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      Payment Method
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            paymentMethod === method.value
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Paid */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={amountPaid}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium"
                    />
                    {amountDue > 0 && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        Due: {formatCurrency(amountDue)}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes (optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Complete Sale Button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={handleCompleteSale}
                    disabled={cart.length === 0 || submitting}
                    className={`w-full py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer ${
                      cart.length === 0 || submitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-200'
                    }`}
                  >
                    {submitting ? 'Processing...' : `Complete Sale - ${formatCurrency(grandTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        title="Sale Completed!"
        showClose={false}
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          {/* Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-900">Sale Completed!</p>
            <p className="text-sm text-gray-500 mt-1">
              Transaction has been recorded successfully.
            </p>
          </div>

          <div className="w-full bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invoice #</span>
              <span className="font-semibold text-gray-900">
                {completedSale?.invoiceNo || completedSale?.id || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-emerald-600 text-base">
                {formatCurrency(completedSale?.total || grandTotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-700 capitalize">
                {paymentMethod}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={() => {
                if (completedSale?.id) {
                  const invoiceData = {
                    ...completedSale,
                    customer: selectedCustomer
                      ? customers.find((c) => c.id === selectedCustomer)
                      : null,
                    items: cart,
                  };
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    const businessLogo = business?.logo
                      ? `<img src="${business.logo}" style="max-width:80px;max-height:80px;margin:0 auto 8px" />`
                      : `<h1 style="margin:0;font-size:20px">${business?.name || 'Business'}</h1>`;
                    const businessAddress = [business?.city, business?.state, business?.pincode].filter(Boolean).join(', ');
                    const businessPhone = business?.phone || '';
                    const businessGST = business?.gstNumber ? `<p style="margin:2px 0;font-size:12px">GST: ${business.gstNumber}</p>` : '';
                    const addressLine = businessAddress ? `<p style="margin:2px 0;font-size:12px">${businessAddress}</p>` : '';
                    const phoneLine = businessPhone ? `<p style="margin:2px 0;font-size:12px">Phone: ${businessPhone}</p>` : '';
                    printWindow.document.write(`
                      <html><head><title>Invoice ${invoiceData.invoiceNo || invoiceData.id}</title>
                      <style>body{font-family:system-ui,sans-serif;max-width:400px;margin:0 auto;padding:20px;font-size:14px}
                      .header{text-align:center;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:16px}
                      .row{display:flex;justify-content:space-between;padding:4px 0}
                      .bold{font-weight:700} .center{text-align:center}
                      table{width:100%;border-collapse:collapse;margin:12px 0}
                      th,td{padding:6px 4px;text-align:left;border-bottom:1px solid #eee}
                      th{font-weight:600;font-size:12px;text-transform:uppercase;color:#666}
                      .total-row{font-size:16px;border-top:2px solid #333}
                      </style></head><body>
                      <div class="header">
                      ${businessLogo}
                      ${!business?.logo ? '' : `<p style="margin:4px 0 0;font-size:14px;font-weight:600">${business?.name || ''}</p>`}
                      ${addressLine}${phoneLine}${businessGST}
                      <p style="margin:8px 0 0;font-size:13px;font-weight:700">INVOICE</p>
                      <p>${invoiceData.invoiceNo || invoiceData.id}</p>
                      <p>${new Date().toLocaleString()}</p>
                      </div>
                      <p><strong>Customer:</strong> ${invoiceData.customer?.name || 'Walk-in Customer'}</p>
                      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
                      ${(invoiceData.items || []).map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${formatCurrency(i.unitPrice)}</td><td>${formatCurrency(i.unitPrice * i.quantity)}</td></tr>`).join('')}
                      </tbody></table>
                      <div class="row bold total-row"><span>Grand Total</span><span>${formatCurrency(invoiceData.total || grandTotal)}</span></div>
                      <p class="center" style="margin-top:20px;color:#888;font-size:12px">Thank you for your purchase!</p>
                      </body></html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }
              }}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Print Invoice
            </button>
            <button
              onClick={handleNewSale}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              New Sale
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default POS;
