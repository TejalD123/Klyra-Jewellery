import AuthLayout from "../../../layout/AuthLayout"
import SignupForm from "../components/SignupForm";
// import poster from "../../../../public/poster.png";

const SignupPage = () => {
  return (
    <AuthLayout  tagline="Crafted for the discerning soul.">
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;