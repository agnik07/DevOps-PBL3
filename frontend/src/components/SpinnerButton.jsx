const SpinnerButton = ({ label, loading, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? "Please wait..." : label}
  </button>
);

export default SpinnerButton;
