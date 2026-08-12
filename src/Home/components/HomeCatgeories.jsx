import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMainCategories } from "../../features/categories/services/categories.slice";
import "../styles/homeCategories.css";

const HOME_CATEGORY_COUNT = 5;

const HomeCategories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: categories, status } = useSelector((s) => s.categories.homeCategories);

  useEffect(() => {
    dispatch(fetchMainCategories(HOME_CATEGORY_COUNT));
  }, [dispatch]);

  return (
    <section className="home-categories">
      <div className="home-categories__inner">
        <div className="home-categories__top">
          <h2 className="home-categories__heading">Curated Categories</h2>
          <button onClick={() => navigate("/categories")} className="home-categories__viewall">
            View All
          </button>
        </div>

        {status === "loading" && (
          <div className="home-categories__grid">
            {Array.from({ length: HOME_CATEGORY_COUNT }).map((_, i) => (
              <div key={i} className="home-categories__skeleton" />
            ))}
          </div>
        )}

        {status === "failed" && (
          <p className="home-categories__empty">Couldn't load categories right now.</p>
        )}

        {status === "succeeded" && categories.length === 0 && (
          <p className="home-categories__empty">No categories available right now.</p>
        )}

        {status === "succeeded" && categories.length > 0 && (
          <div className="home-categories__grid">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => navigate(`/categories/${cat.slug}`)}
                className="home-categories__item"
              >
                <div className="home-categories__ring">
                  <div className="home-categories__photo">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} />
                    ) : (
                      <span className="home-categories__photo-label">{cat.name}</span>
                    )}
                  </div>
                </div>
                <span className="home-categories__name">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCategories;