'use client';

import React, { useEffect, useState } from "react";

const PayPalErrorPage = () => {
  const [message, setMessage] = useState("Ocurrió un error desconocido.");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("message");
    if (msg) {
      setMessage(msg);
    }
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚠️ Ha ocurrido un error con PayPal</h1>
      <p style={styles.message}>{message}</p>
      <a href="/dashboard" style={styles.link}>Volver al inicio</a>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "1.8rem",
    color: "#c0392b",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.2rem",
    marginBottom: "2rem",
  },
  link: {
    display: "inline-block",
    marginTop: "1rem",
    padding: "0.8rem 1.2rem",
    backgroundColor: "#3498db",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
  },
};

export default PayPalErrorPage;
