export default function UnauthorizedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f7f1e3",
        padding: "24px",
        color: "#24322d",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "520px",
          background: "#fffaf0",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(36, 50, 45, 0.12)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#6f7f77" }}>
          Unauthorized
        </p>
        <h1 style={{ margin: "12px 0 10px", fontSize: "32px", lineHeight: 1.1 }}>You do not have access to this area.</h1>
        <p style={{ margin: 0, color: "#5c6b64", lineHeight: 1.6 }}>
          Use an account with the correct role, or return to login and continue with the demo flow.
        </p>
        <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="/login"
            style={{
              background: "#24322d",
              color: "#fff",
              borderRadius: "999px",
              padding: "12px 18px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go to login
          </a>
        </div>
      </section>
    </main>
  );
}
