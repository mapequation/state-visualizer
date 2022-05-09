export default function Logo({ width = 50, height = 50 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mapequation-logo"
      viewBox="0 0 119.6 96.14"
      width={width}
      height={height}
    >
      <style>
        {`
          svg.mapequation-logo g.compass {
            transform: translateY(0);
            transition: transform 200ms ease-in-out;
            animation: compass 1 1s;
          }
          
          svg.mapequation-logo:hover g.compass {
            transform: translateY(-10px);
          }
          
          @keyframes compass {
            0% {
              transform: scale(1) translate(-60px, 20px);
            }
            100% {
              transform: scale(1) translate(0, 0);
            }
          }
        `}
      </style>
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.408"
        d="M30.173 82.807c20.93 1.004 51.68 2.619 68.49-.522"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2.112"
        d="M97.824 82.007c-3.67-7.094-5.21-22.48-.689-23.22"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="3.52"
        d="M31.324 82.707c25.16-4.59 50.15-13.5 65.42-23.06"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2.816"
        d="M25.556 54.507c14.01 2.32 54.37 5.086 70.8 4.413"
      />
      <path
        fill="#fff"
        stroke="#fff"
        strokeWidth=".704"
        d="M64.674 82.007a32.16 13.76 0 0 1-64.31 0 32.16 13.76 0 1 1 64.31 0zm-18.49-27.2a20.39 8.728 0 0 1-40.78 0 20.39 8.728 0 1 1 40.78 0zm73.02 3.5a23.28 9.962 0 0 1-46.55 0 23.28 9.962 0 1 1 46.55 0zm-6.91 25.1a14.63 6.26 0 0 1-29.25 0 14.63 6.26 0 1 1 29.25 0z"
      />
      <path
        fill="none"
        stroke="#555"
        strokeWidth="1.408"
        d="M30.173 79.807c20.93 1.004 51.68 2.619 68.49-.522"
      />
      <path
        fill="none"
        stroke="#555"
        strokeWidth="2.112"
        d="M97.824 78.907c-3.67-7.094-5.21-22.48-.689-23.22"
      />
      <path
        fill="none"
        stroke="#555"
        strokeWidth="3.52"
        d="M31.324 79.607c25.16-4.59 50.15-13.5 65.42-23.06"
      />
      <path
        fill="none"
        stroke="#555"
        strokeWidth="2.816"
        d="M25.556 51.507c14.01 2.32 54.37 5.086 70.8 4.413"
      />
      <path
        fill="#555"
        stroke="#fff"
        strokeWidth=".704"
        d="M64.674 79.007a32.16 13.76 0 0 1-64.31 0 32.16 13.76 0 1 1 64.31 0zm-18.49-27.3a20.39 8.728 0 0 1-40.78 0 20.39 8.728 0 1 1 40.78 0zm73.02 3.5a23.28 9.962 0 0 1-46.55 0 23.28 9.962 0 1 1 46.55 0zm-6.91 25.1a14.63 6.26 0 0 1-29.25 0 14.63 6.26 0 1 1 29.25 0z"
      />
      <g className="compass">
        <path fill="#fff" d="M81.644 26.607h28.57l-14.29 33.16z" />
        <path
          fill="none"
          stroke="#fff"
          strokeWidth="10"
          d="M107.426 19.572c0 6.35-5.148 11.5-11.5 11.5-6.35 0-11.5-5.148-11.5-11.5 0-6.351 5.148-11.5 11.5-11.5 6.351 0 11.5 5.148 11.5 11.5z"
        />
        <path fill="#b22" d="M81.644 23.507h28.57l-14.29 33.16z" />
        <path
          fill="none"
          stroke="#b22"
          strokeWidth="10"
          d="M107.426 16.5c0 6.351-5.148 11.5-11.5 11.5-6.35 0-11.5-5.148-11.5-11.5 0-6.351 5.148-11.5 11.5-11.5 6.351 0 11.5 5.148 11.5 11.5z"
        />
      </g>
    </svg>
  );
}
