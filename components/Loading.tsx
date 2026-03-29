export default function Loading() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "60vh",
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: "3px solid #2a2d35",
        borderTop: "3px solid #6c71e8",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}