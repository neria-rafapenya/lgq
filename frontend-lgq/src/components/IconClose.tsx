type IconCloseProps = {
  size?: number;
  className?: string;
  title?: string;
};

function IconClose({ size = 12, className, title }: IconCloseProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path
        d="M10.0429 0.292908C10.4334 -0.0976166 11.0664 -0.0976166 11.4569 0.292908C11.8474 0.683439 11.8474 1.31648 11.4569 1.70697L7.28897 5.87494L11.4569 10.0429C11.8474 10.4334 11.8474 11.0665 11.4569 11.457C11.0664 11.8474 10.4334 11.8474 10.0429 11.457L5.87491 7.289L1.70694 11.457C1.31644 11.8474 0.683399 11.8474 0.292877 11.457C-0.097637 11.0665 -0.0976166 10.4334 0.292877 10.0429L4.46085 5.87494L0.292877 1.70697C-0.097637 1.31646 -0.0976166 0.683434 0.292877 0.292908C0.683401 -0.0976166 1.31642 -0.0976166 1.70694 0.292908L5.87491 4.46088L10.0429 0.292908Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default IconClose;
