import { useNavigate } from "react-router-dom"; // Import useNavigate
import exitButton from "../../assets/images/Exit.png"; // Import exitButton image
import { FaArrowLeft } from "react-icons/fa"; // Import left arrow icon

const ForgotPass = () => {
  const navigate = useNavigate();

  const handleSubmitButton = () => {
    navigate("/email-Verification-Code");
  };

  const handleExitClick = () => {
    navigate("/"); // Navigate to LoginPage
  };

  const handleSigninClick = () => {
    navigate("/"); // Navigate to LoginPage
  };

  return (
    <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center h-screen w-full">
      {/* Main content */}
      <div
        className="d-flex flex-column position-relative justify-content-center align-items-center w-100"
        style={{
          gap: "20px",
          padding: "100px", // Padding for larger screens
          minHeight: "100vh", // Ensures it takes the full vertical space
          maxWidth: "100vw", // Max width for responsiveness
        }}
      >
        {/* Exit Button for Larger Screens */}
        <button
          className="d-none d-lg-block border-0 bg-transparent position-absolute"
          onClick={handleExitClick}
          style={{
            right: "100px", // Maintain fixed right padding for large screens
            top: "40px", // Adjust vertical position
          }}
        >
          <img
            src={exitButton}
            alt="Exit"
            style={{ width: "58.5px", height: "58.5px" }}
          />
        </button>

        {/* Arrow Icon Button for Smaller Screens */}
        <button
          className="d-lg-none border-0 bg-transparent position-absolute"
          onClick={handleExitClick}
          style={{
            left: "50px", // Maintain fixed left padding for small screens
            top: "40px", // Adjust vertical position
          }}
        >
          <FaArrowLeft style={{ color: "#E2DDF3", fontSize: "1.5rem" }} />
        </button>

        {/* Form Content */}
        <div className="text-center w-100" style={{ maxWidth: "450px" }}>
          {/* Title */}
          <h2
            className="fw-bold text-white"
            style={{ fontSize: "48px", color: "#1D242E" }}
          >
            Forgot password?
          </h2>
          <p
            className="mb-4 fw-regular"
            style={{
              fontSize: "24px",
              color: "#E2DDF3",
              maxWidth: "100%",
              wordWrap: "break-word",
              margin: "0 auto", // Center the subtitle
            }}
          >
            Please enter your email or mobile number to search for your account.
          </p>

          {/* Form */}
          <div className="d-flex flex-column align-items-center w-100">
            <input
              type="text"
              className="form-control mb-2"
              style={{
                backgroundColor: "#3B354D",
                color: "#E2DDF3",
                marginTop: "30px",
                width: "100%", // Responsive width
                padding: "0.75rem 1rem",
                fontSize: "20px",
                border: "none",
              }}
              id="userIDInput"
              placeholder="Enter your phone or email"
            />

            {/* Submit Button */}
            <button
              style={{
                marginTop: "12px",
                width: "100%", // Responsive width
                fontWeight: "600",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                backgroundColor: "#4D18E8",
                color: "#E2DDF3",
                fontSize: "20px",
                transition: "background-color 0.3s ease, transform 0.3s ease",
              }}
              className="btn btn-hover"
              type="submit"
              onClick={handleSubmitButton}
            >
              Submit
            </button>
            <p
              className="mb-4 fw-regular"
              style={{
                fontSize: "20px",
                marginTop: "30px",
                color: "#A1A1A1",
                wordWrap: "break-word",
                margin: "0 auto", // Center the subtitle
              }}
            >
              Already have an account?{" "}
              <button
                style={{
                  marginTop: "39px",
                  background: "none",
                  border: "none",
                  fontWeight: "700",
                  color: "#E2DDF3",
                  textDecoration: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={handleSigninClick}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;
