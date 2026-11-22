import { NavLink } from "react-router-dom";

const NavbarIcon = ({
  icon: Icon,
  label,
  to,
  onClick,
  theme,
  count = null,
  showLabel = false,
  disabled = false,
  end = false,
}) => {
  const baseClass = `
    group relative
    inline-flex items-center justify-center gap-2
    min-w-[44px] min-h-[44px]
    rounded-xl px-3 py-2
    transition-colors duration-200
    hover:bg-[var(--navbar-hover)]
    focus-visible:outline
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-[var(--navbar-color)]
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const themeStyle = {
    "--navbar-color": theme.foreground,
    "--navbar-hover": theme.hover,
    "--navbar-active": theme.active,
    color: theme.foreground,
  };

  const renderContent = () => (
    <>
      {Icon && (
        <Icon
          className="w-6 h-6 shrink-0"
          aria-hidden="true"
        />
      )}

      {count !== null && count !== undefined && (
        <span className="text-sm font-bold">
          {count}
        </span>
      )}

      {showLabel && (
        <span className="text-sm font-semibold">
          {label}
        </span>
      )}

      {!showLabel && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-1/2 top-full
            -translate-x-1/2 mt-2
            whitespace-nowrap
            rounded-lg px-3 py-1.5
            bg-[#403456] text-white
            text-xs font-medium
            opacity-0 invisible
            group-hover:opacity-100
            group-hover:visible
            group-focus-visible:opacity-100
            group-focus-visible:visible
            transition-opacity duration-150
            shadow-md z-50
          "
        >
          {label}
        </span>
      )}
    </>
  );

  if (to && !disabled) {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        aria-label={label}
        style={themeStyle}
        className={({ isActive }) =>
          `${baseClass} ${
            isActive
              ? "bg-[var(--navbar-active)]"
              : ""
          }`
        }
      >
        {renderContent()}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={themeStyle}
      className={baseClass}
    >
      {renderContent()}
    </button>
  );
};

export default NavbarIcon;