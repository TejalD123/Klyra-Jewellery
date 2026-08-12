import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../styles/ProductDetail.css";

const AccordionItem = ({ title, children, isOpen, onToggle }) => (
  <div className="product-accordion__item">
    <button onClick={onToggle} className="product-accordion__trigger">
      <span className="product-accordion__title">{title}</span>
      <ChevronDown size={18} className={`product-accordion__chevron ${isOpen ? "product-accordion__chevron--open" : ""}`} />
    </button>
    {isOpen && <div className="product-accordion__content">{children}</div>}
  </div>
);

const ProductAccordion = ({ product }) => {
  const [openSection, setOpenSection] = useState("description");
  const toggle = (key) => setOpenSection((prev) => (prev === key ? null : key));

  return (
    <div className="product-accordion">
      <AccordionItem title="Description" isOpen={openSection === "description"} onToggle={() => toggle("description")}>
        {product.description || "No description available."}
      </AccordionItem>

      <AccordionItem title="Specifications" isOpen={openSection === "specs"} onToggle={() => toggle("specs")}>
        <ul>
          <li>SKU: {product.sku}</li>
          <li>
            Metal: {product.metalType} {product.purity && `(${product.purity})`}
          </li>
          <li>Weight: {product.weight} g</li>
          <li>Stone: {product.stoneType}</li>
          <li>Making Charges: ₹{product.makingCharges}</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Shipping & Returns" isOpen={openSection === "shipping"} onToggle={() => toggle("shipping")}>
        Free insured shipping. 7-day return window for unworn items with original packaging and certificate.
      </AccordionItem>
    </div>
  );
};

export default ProductAccordion;
