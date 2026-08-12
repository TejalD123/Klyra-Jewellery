import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../styles/Auth.css";

const CustomPhoneInput = ({ value, onChange }) => {
  return (
    <div className="phone-input-wrapper">
      <PhoneInput
        international
        defaultCountry="IN"
        value={value}
        onChange={onChange}
        placeholder="98765 43210"
      />
    </div>
  );
};

export default CustomPhoneInput;