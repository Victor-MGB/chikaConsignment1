import React, { useState, useEffect } from "react";
import axios from "axios";
function App() {
  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    courierType: "",
  });

  const [loginFormData, setLoginFormData] = useState({
    name: "",
    phoneNumber: "",
  });

  const [goldData, setGoldData] = useState([]);

  useEffect(() => {
    // Fetch gold data when the component mounts
    fetchGoldData();
  }, []);

  const fetchGoldData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/getgold");
      setGoldData(response.data);
    } catch (error) {
      console.error("Error fetching gold data:", error.message);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerFormData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Registration failed: ${errorMessage}`);
      }

      const result = await response.json();
      console.log(result.message);

      // Optional: Reset form data after successful registration
      setRegisterFormData({
        name: "",
        email: "",
        phoneNumber: "",
        location: "",
        courierType: "",
      });
    } catch (error) {
      console.error("Error during registration:", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginFormData),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(`Login failed: ${errorMessage.error}`);
      }

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Error during login:", error.message);
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Consignment App</h1>

      {/* Registration Form */}
      <h2>Register</h2>
      <form style={styles.form}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={registerFormData.name}
          onChange={(e) =>
            setRegisterFormData({ ...registerFormData, name: e.target.value })
          }
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={registerFormData.email}
          onChange={(e) =>
            setRegisterFormData({ ...registerFormData, email: e.target.value })
          }
          required
        />

        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={registerFormData.phoneNumber}
          onChange={(e) =>
            setRegisterFormData({
              ...registerFormData,
              phoneNumber: e.target.value,
            })
          }
          required
        />

        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={registerFormData.location}
          onChange={(e) =>
            setRegisterFormData({
              ...registerFormData,
              location: e.target.value,
            })
          }
          required
        />

        <label htmlFor="courierType">Courier Type:</label>
        <input
          type="text"
          id="courierType"
          name="courierType"
          value={registerFormData.courierType}
          onChange={(e) =>
            setRegisterFormData({
              ...registerFormData,
              courierType: e.target.value,
            })
          }
          required
        />

        <button type="button" onClick={handleRegister}>
          Register
        </button>
      </form>

      {/* Login Form */}
      <h2>Login</h2>
      <form style={styles.form}>
        <label htmlFor="loginName">Name:</label>
        <input
          type="text"
          id="loginName"
          name="name"
          value={loginFormData.name}
          onChange={(e) =>
            setLoginFormData({ ...loginFormData, name: e.target.value })
          }
          required
        />

        <label htmlFor="loginPhoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="loginPhoneNumber"
          name="phoneNumber"
          value={loginFormData.phoneNumber}
          onChange={(e) =>
            setLoginFormData({ ...loginFormData, phoneNumber: e.target.value })
          }
          required
        />

        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </form>

      {/* Gold App */}
      <h1 style={styles.heading}>Gold App</h1>
      <ul style={styles.list}>
        {goldData.map((goldItem) => (
          <li key={goldItem.id} style={styles.listItem}>
            <h3 style={styles.itemName}>{goldItem.name}</h3>
            <p style={styles.itemPrice}>Price: {goldItem.price}</p>
            <img
              src={`http://localhost:4000${goldItem.image}`}
              alt={`Gold: ${goldItem.name}`}
              style={styles.itemImage}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    color: "#333",
    fontSize: "24px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  list: {
    listStyle: "none",
    padding: "0",
  },
  listItem: {
    margin: "20px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
  },
  itemName: {
    color: "#555",
    fontSize: "18px",
    marginBottom: "10px",
  },
  itemPrice: {
    color: "#777",
    fontSize: "16px",
    marginBottom: "15px",
  },
  itemImage: {
    maxWidth: "100%",
    height: "auto",
  },
};

export default App;
