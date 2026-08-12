import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { fetchCart } from "../../cart/services/cart.slice"; // ⚠️ adjust path if different
import {
  fetchAddresses,
  openAddressForm,
} from "../../address/services/address.slice"; // ⚠️ adjust path
import { createOrder, resetCreateStatus } from "../services/order.slice";
import AddressForm from "../../address/component/AddressForm"; // ⚠️ adjust path
import AddressSelector from "../components/AddressSelector";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import "../styles/Order.css";
import "../styles/Checkout.css";
import { loadRazorpay } from "../../../utils/loadRazorpay"; // ⚠️ adjust path
import { createPaymentOrder, verifyPayment, resetPaymentState } from "../../payment/services/payment.slice"; // ⚠️ adjust path

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num || 0);

// Mirrors order.service.js's calculateShippingCharge — display-only estimate,
// the real total is calculated server-side when the order is placed.
const FREE_SHIPPING_THRESHOLD = 2000;
const FLAT_SHIPPING_CHARGE = 99;

const imgUrl = (img) =>
  typeof img === "string" ? img : img?.url || img?.secure_url || "";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // matches cart.slice.js: items/totalAmount live directly on state.cart,
  // there is no `data` wrapper
  const {
    items: cartItems,
    totalAmount,
    status: cartStatus,
    error: cartError,
  } = useSelector((s) => s.cart);
  const addressList = useSelector((s) => s.address);
  const { createStatus, createError } = useSelector((s) => s.orders);
  const { createError: paymentCreateError, verifyError } = useSelector((s) => s.payment);

  const [addressId, setAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // covers the Razorpay-open window, separate from createStatus/payment slice statuses

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
    return () => {
      dispatch(resetCreateStatus());
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  // Auto-select default address whenever the address list changes
  // (covers initial load AND right after adding a new one that's default)
  useEffect(() => {
    if (!addressList.list?.length) return;
    const stillExists = addressList.list.some((a) => a._id === addressId);
    if (!addressId || !stillExists) {
      const def =
        addressList.list.find((a) => a.isDefault) || addressList.list[0];
      setAddressId(def._id);
    }
  }, [addressList.list, addressId]);

  const pricing = useMemo(() => {
    if (!cartItems.length) return null;
    const subtotal = totalAmount;
    const shippingCharge =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_CHARGE;
    return { subtotal, shippingCharge, total: subtotal + shippingCharge };
  }, [cartItems, totalAmount]);

  const hasUnavailableItems = cartItems.some((i) => i.outOfStock);

  const handlePlaceOrder = async () => {
    if (!addressId || !paymentMethod) return;
    setIsProcessing(true);

    try {
      // Step 1: create the order (server-side pricing, stock check, etc.)
      const order = await dispatch(createOrder({ addressId, paymentMethod })).unwrap();

      // Step 2: COD — nothing more to collect, straight to confirmation
      if (paymentMethod === "cod") {
        navigate(`/orders/${order._id}`, { replace: true });
        return;
      }

      // Step 3: card/upi — create the Razorpay order on our backend
      const paymentOrder = await dispatch(
        createPaymentOrder({ orderId: order._id, paymentMethod })
      ).unwrap();

      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        throw new Error("Could not load Razorpay checkout. Please check your connection and try again.");
      }

      // Step 4: open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        order_id: paymentOrder.razorpayOrderId,
        name: "Klyra Jewellery",
        description: `Order ${order.orderNumber || ""}`.trim(),
        prefill: {
          name: order.shippingAddress?.fullName,
          contact: order.shippingAddress?.phoneNumber,
        },
        handler: async (response) => {
          try {
            await dispatch(
              verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: order._id,
              })
            ).unwrap();

            navigate(`/orders/${order._id}`, { replace: true });
          } catch (err) {
            // verification failed — leave user on checkout, verifyError renders below
            setIsProcessing(false);
          }
        },
        modal: {
          // user closed the Razorpay widget without paying — order stays "placed"/"pending",
          // let them retry from this same page
          ondismiss: () => setIsProcessing(false),
        },
        theme: { color: "#b08d57" },
      });

      razorpay.on("payment.failed", () => setIsProcessing(false));
      razorpay.open();
    } catch (err) {
      // createOrder or createPaymentOrder rejected — createError/paymentCreateError render below
      setIsProcessing(false);
    }
  };

  if (cartStatus === "loading" || cartStatus === "idle") {
    return (
      <div className="order-page">
        <div className="order-page__skeleton-list">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="order-page__skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (cartStatus === "failed") {
    return (
      <div className="order-page">
        <p className="order-page__error">{cartError}</p>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="order-page">
        <div className="order-page__empty">
          <p className="order-page__empty-text">Your cart is empty</p>
          <button
            onClick={() => navigate("/categories")}
            className="order-page__empty-btn"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  const canPay = Boolean(addressId);
  const canPlaceOrder =
    Boolean(addressId) && Boolean(paymentMethod) && !hasUnavailableItems;
  const placeOrderError = createError || paymentCreateError || verifyError;

  return (
    <div className="order-page">
      <h1 className="order-page__title">Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-main">
          {hasUnavailableItems && (
            <div className="checkout-warning">
              <AlertTriangle size={16} />
              <span>
                Some items in your cart are out of stock or unavailable. Please
                update your cart before checking out.
              </span>
            </div>
          )}

          {/* ---- Step 1: Review items ---- */}
          <section className="order-detail__card">
            <h2 className="order-detail__card-title">
              Review Items ({cartItems.length})
            </h2>
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className={`checkout-item-row ${item.outOfStock ? "is-unavailable" : ""}`}
                >
                  <div className="order-detail__item-thumb">
                    {item.product?.images?.[0] && (
                      <img
                        src={imgUrl(item.product.images[0])}
                        alt={item.product.name}
                      />
                    )}
                  </div>
                  <div className="order-detail__item-body">
                    <p className="order-detail__item-name">
                      {item.product?.name || "Unavailable product"}
                    </p>
                    <p className="order-detail__item-meta">
                      {item.product?.metalType}{" "}
                      {item.size && `· Size ${item.size}`} · Qty {item.quantity}
                    </p>
                    {item.outOfStock && (
                      <p className="checkout-item-row__flag">Out of stock</p>
                    )}
                  </div>
                  <p className="order-detail__item-price">
                    {formatINR(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ---- Step 2: Address ---- */}
          <section className="order-detail__card">
            <h2 className="order-detail__card-title">Delivery Address</h2>
            {addressList.status === "loading" ? (
              <p className="checkout-section__hint">Loading addresses…</p>
            ) : (
              <AddressSelector
                addresses={addressList.list}
                selectedId={addressId}
                onSelect={setAddressId}
                onAddNew={() => dispatch(openAddressForm())}
              />
            )}
          </section>

          {/* ---- Step 3: Payment (locked until address is chosen) ---- */}
          <section
            className={`order-detail__card ${!canPay ? "checkout-section--locked" : ""}`}
          >
            <h2 className="order-detail__card-title">Payment Method</h2>
            {canPay ? (
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            ) : (
              <p className="checkout-section__hint">
                Select a delivery address to continue
              </p>
            )}
          </section>
        </div>

        {/* ---- Sticky order summary ---- */}
        <aside className="checkout-summary">
          <div className="order-detail__card">
            <h2 className="order-detail__card-title">Price Details</h2>
            <div className="order-detail__price-rows">
              <div className="order-detail__price-row">
                <span>Subtotal</span>
                <span>{formatINR(pricing.subtotal)}</span>
              </div>
              <div className="order-detail__price-row">
                <span>Shipping</span>
                <span>
                  {pricing.shippingCharge === 0
                    ? "Free"
                    : formatINR(pricing.shippingCharge)}
                </span>
              </div>
              <div className="order-detail__price-row--total">
                <span>Total</span>
                <span>{formatINR(pricing.total)}</span>
              </div>
            </div>

            {placeOrderError && (
              <p className="order-page__error" style={{ marginTop: "0.75rem" }}>
                {placeOrderError}
              </p>
            )}

            <button
              type="button"
              className="checkout-place-order-btn"
              disabled={!canPlaceOrder || isProcessing || createStatus === "loading"}
              onClick={handlePlaceOrder}
            >
              {isProcessing || createStatus === "loading" ? (
                <Loader2 size={16} className="checkout-spin" />
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Global address-form modal — opens when "Add New Address" is clicked */}
      <AddressForm />
    </div>
  );
};

export default CheckoutPage;