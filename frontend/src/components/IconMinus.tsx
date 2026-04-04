type IconMinusProps = {
  size?: number;
  className?: string;
  title?: string;
};

function IconMinus({ size = 14, className, title }: IconMinusProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={Math.max(2, Math.round(size / 7))}
      viewBox="0 0 14 2"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d="M14 2H0V0H14V2Z" fill="currentColor" />
    </svg>
  );
}

export default IconMinus;
