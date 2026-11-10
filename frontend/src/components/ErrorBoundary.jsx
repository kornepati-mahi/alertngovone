import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: 16,
            padding: "24px 32px",
            textAlign: "center",
            margin: "24px 0"
          }}
        >
          <h4 style={{ color: "#e11d48", margin: "0 0 8px" }}>Component Error</h4>
          <p style={{ color: "#4b5563", fontSize: "0.9rem", margin: "0 0 16px" }}>
            Something went wrong while rendering this section.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn btn-sm btn-primary"
            style={{ borderRadius: 20 }}
          >
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
