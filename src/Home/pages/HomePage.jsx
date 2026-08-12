import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SalesBanner from "../components/SalesBanner";
import Hero from "../components/Hero";
import TrustBadges from "../components/TrustBadges";

import BestSellers from "../components/BestSellers";
import Newsletter from "../components/Newsletter";
import HomeCategories from "../components/HomeCatgeories";

const HomePage = () => {
  return (
    <div>
      
     
      <main>
        <Hero />
        <TrustBadges />
        <HomeCategories/>
        <BestSellers />
        <SalesBanner />
        <Newsletter />
      </main>
      
    </div>
  );
};

export default HomePage;