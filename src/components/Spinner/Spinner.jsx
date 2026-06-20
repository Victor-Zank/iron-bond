import './Spinner.css';

export default function Spinner({ size = 48 }) {
  return (
    <div className="spinner-ctr">
      <svg className="spinner" width={size} height={size} viewBox="0 0 50 50">
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
      </svg>
    </div>
  );
}
