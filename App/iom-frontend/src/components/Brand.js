export default function Brand({ large = false }) {
  return (
    <span className={`brand ${large ? "brand-large" : ""}`}>
      <img src="/ironroot-mark.svg" alt="" />
      <span>
        <strong>IRONROOT</strong>
        <small>SOLUTIONS</small>
      </span>
    </span>
  );
}
