import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllMainCategories } from "../services/categories.slice";
import CategoryCard from "../components/CategoryCard";
import "../styles/Categories.css";

const AllCategoriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: categories, status, error } = useSelector((s) => s.categories.allMainCategories);

  useEffect(() => {
    dispatch(fetchAllMainCategories());
  }, [dispatch]);

  return (
    <div className="all-categories-page">
      <h1 className="all-categories-page__title">All Categories</h1>

      {status === "loading" && (
        <div className="category-grid category-grid--wide">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="category-grid__skeleton category-grid__skeleton--circle" />
          ))}
        </div>
      )}

      {status === "failed" && <p className="category-grid__error">{error}</p>}

      {status === "succeeded" && (
        <div className="category-grid category-grid--wide">
          {categories.map((cat) => (
            <CategoryCard key={cat._id} name={cat.name} image={cat.image} shape="circle" onClick={() => navigate(`/categories/${cat.slug}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllCategoriesPage;