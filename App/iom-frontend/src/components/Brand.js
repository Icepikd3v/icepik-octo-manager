export default function Brand({ large = false }) {
  return (
    <span className={`brand ${large ? "brand-large" : ""}`}>
      <img src="/ironroot-mark.svg?v=grounded-circuit" alt="" />
      <span>
        <strong>IRONROOT</strong>
        <small>SOLUTIONS</small>
      </span>
    </span>
  );
}
