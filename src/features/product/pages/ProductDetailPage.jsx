import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductBySlug, clearProductDetail } from "../services/product.slice";
// apna actual path confirm karo
import { addToCart, notifyItemAdded } from "../../cart/services/cart.slice";// apna actual path confirm karo
import ProductImageGallery from "../components/ProductImageGallary";
import ProductInfo from "../components/ProductInfo";
import CraftSection from "../components/CraftSection";
import ReviewsSection from "../../reviews/components/ReviewsSection"; // NEW
import RelatedProducts from "../components/RelatedProducts";
import "../styles/ProductDetail.css";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: product, status, error } = useSelector((s) => s.productDetail.product);
  const { data: related } = useSelector((s) => s.productDetail.related);
  const isLoggedIn = !!useSelector((s) => s.auth.token);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => dispatch(clearProductDetail());
  }, [dispatch, slug]);

  const handleAddToCart = async (selection) => {
    if (!isLoggedIn) {
      // LoginPage ko `location.state.from` se redirect-back handle karna hoga —
      // agar abhi wo logic nahi hai to bata dena, add kar denge
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const result = await dispatch(
      addToCart({ productId: product._id, quantity: 1, size: selection?.size || "" })
    );

    if (addToCart.fulfilled.match(result)) {
      dispatch(notifyItemAdded({ message: "Product added to cart" }));
    }
    // rejected case cart.slice ke andar state.error mein already capture ho raha hai
  };

  const handleAddToWishlist = () => {
    console.log("Add to wishlist", product._id);
  };

  if (status === "loading") {
    return (
      <div className="product-detail-page">
        <div className="product-detail__layout">
          <div className="product-detail__skeleton-media" />
          <div className="product-detail__skeleton-col">
            <div className="product-detail__skeleton-line" style={{ width: "75%" }} />
            <div className="product-detail__skeleton-line" style={{ width: "33%" }} />
            <div className="product-detail__skeleton-line" style={{ height: "6rem" }} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="product-detail__error">
        <p>{error}</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail-page">
      <div className="product-detail__layout">
        <ProductImageGallery images={product.images} name={product.name} />
        <ProductInfo product={product} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
      </div>

      <CraftSection product={product} />
      <ReviewsSection productId={product._id} />
      <RelatedProducts products={related} />
    </div>
  );
};

export default ProductDetailPage;