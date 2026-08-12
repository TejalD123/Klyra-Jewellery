import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoryBySlug, fetchSubcategories, clearCurrentCategory } from "../services/categories.slice";
import CategoryCard from "../components/CategoryCard";
import "../styles/Categories.css";

const CategorySubcategoriesPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: category, status: categoryStatus } = useSelector((s) => s.categories.currentCategory);
  const { data: subcategories, status: subStatus } = useSelector((s) => s.categories.subcategories);

  useEffect(() => {
    dispatch(fetchCategoryBySlug(slug));
    return () => dispatch(clearCurrentCategory());
  }, [dispatch, slug]);

  useEffect(() => {
    if (category?._id) dispatch(fetchSubcategories(category._id));
  }, [dispatch, category?._id]);

  const handleSubcategoryClick = (sub) => {
    navigate(`/products?category=${sub._id}`);
  };

  // NEW: poster resolution — desktop poster falls back to the mobile
  // poster (and vice versa) if only one was uploaded, and both fall back
  // to the old `image` field so nothing breaks for categories created
  // before this feature existed.
  const desktopPosterUrl = category?.posterDesktop || category?.posterMobile || category?.image || "";
  const mobilePosterUrl = category?.posterMobile || category?.posterDesktop || category?.image || "";

  return (
    <div>
      {categoryStatus === "loading" && <div className="category-hero__skeleton" />}

      {categoryStatus === "succeeded" && category && (
        <div className="category-hero">
          {/* NEW: two separately-cropped background layers, CSS media
              query decides which one is visible so mobile shows only
              the jewellery part instead of the desktop banner scaled/cut */}
          {desktopPosterUrl && (
            <div
              className="category-hero__bg category-hero__bg--desktop"
              style={{ backgroundImage: `url(${desktopPosterUrl})` }}
            />
          )}
          {mobilePosterUrl && (
            <div
              className="category-hero__bg category-hero__bg--mobile"
              style={{ backgroundImage: `url(${mobilePosterUrl})` }}
            />
          )}

          <div className="category-hero__overlay">
            <h1 className="category-hero__title">{category.name}</h1>
            {category.description && <p className="category-hero__desc">{category.description}</p>}
          </div>
        </div>
      )}

      <div className="category-sub-body">
        <h2 className="category-sub-body__heading">Shop Subcategories</h2>

        {subStatus === "loading" && (
          <div className="category-grid category-grid--wide">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="category-grid__skeleton" />
            ))}
          </div>
        )}

        {subStatus === "succeeded" && subcategories.length === 0 && (
          <p className="category-grid__empty">No subcategories yet — browse products in this category directly.</p>
        )}

        {subStatus === "succeeded" && subcategories.length > 0 && (
          <div className="category-grid category-grid--wide">
            {subcategories.map((sub) => (
              <CategoryCard key={sub._id} name={sub.name} image={sub.image} onClick={() => handleSubcategoryClick(sub)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySubcategoriesPage;