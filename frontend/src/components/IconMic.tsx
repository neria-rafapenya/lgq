type IconMicProps = {
  size?: number;
  color?: string;
};

const IconMic = ({ size = 18, color = "currentColor" }: IconMicProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 15.5c2.209 0 4-1.791 4-4V6.5c0-2.209-1.791-4-4-4s-4 1.791-4 4v5c0 2.209 1.791 4 4 4Z"
        fill={color}
      />
      <path
        d="M6 11.5a1 1 0 1 0-2 0c0 4.078 3.055 7.444 7 7.93V22a1 1 0 1 0 2 0v-2.57c3.945-.486 7-3.852 7-7.93a1 1 0 1 0-2 0c0 3.314-2.686 6-6 6s-6-2.686-6-6Z"
        fill={color}
      />
    </svg>
  );
};

export default IconMic;
