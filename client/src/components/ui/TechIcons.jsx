/**
 * TechIcons.jsx — High-fidelity official vector brand SVG icons for the modern Tech Stack
 * Optimized for crisp retina rendering, custom brand fills, and zero external network latency.
 */

export function ReactIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="-11.5 -10.23174 23 20.46348" className={className} fill="none">
      <circle cx="0" cy="0" r="2.05" fill="#00D8FE" />
      <g stroke="#00D8FE" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  )
}

export function NextjsIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 180 180" className={className} fill="none">
      <mask height="180" id="mask-next" maskUnits="userSpaceOnUse" width="180" x="0" y="0" style={{ maskType: 'alpha' }}>
        <circle cx="90" cy="90" fill="#000" r="90" />
      </mask>
      <g mask="url(#mask-next)">
        <circle cx="90" cy="90" fill="#090d16" r="90" stroke="#1e293b" strokeWidth="4" />
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="url(#next-grad-1)"
        />
        <rect fill="url(#next-grad-2)" height="72" width="12" x="115" y="54" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="next-grad-1" x1="109" x2="144.5" y1="116.5" y2="160.5">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" id="next-grad-2" x1="121" x2="120.799" y1="54" y2="106.875">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function TailwindIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 54 33" className={className} fill="none">
      <path
        d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
        fill="#06B6D4"
      />
    </svg>
  )
}

export function TypeScriptIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className}>
      <rect width="128" height="128" rx="20" fill="#3178C6" />
      <path
        d="M74.9 83.1c1.8 3.1 4.5 5.5 8.2 7.1 3.7 1.6 8 2.4 12.9 2.4 4.3 0 8.1-.7 11.3-2.1 3.2-1.4 5.7-3.5 7.4-6.2 1.8-2.7 2.6-5.9 2.6-9.6 0-3.3-.7-6.1-2.1-8.4s-3.4-4.2-6.1-5.7c-2.7-1.5-6.1-2.8-10.3-4-4.2-1.2-7.3-2.3-9.4-3.3-2.1-1-3.7-2.3-4.8-3.7-1.1-1.5-1.7-3.3-1.7-5.5 0-2.3.6-4.3 1.9-6 1.3-1.7 3.2-3.1 5.7-4 2.5-.9 5.5-1.4 8.9-1.4 3.5 0 6.6.6 9.3 1.8 2.7 1.2 4.9 3 6.5 5.3l10.9-7.5c-2.9-3.9-6.9-6.9-12-8.9-5.1-2.1-11-3.1-17.6-3.1-6.1 0-11.5 1-16.1 3.1s-8.2 5.1-10.7 9.1c-2.5 4-3.8 8.7-3.8 14.1 0 5.2 1.2 9.7 3.6 13.4 2.4 3.7 5.7 6.6 9.9 8.7s9.2 3.8 14.9 5.2c4.1 1 7.2 2 9.3 2.9 2.1 1 3.7 2.1 4.8 3.5s1.6 3.2 1.6 5.4c0 2.2-.6 4.1-1.9 5.7-1.3 1.6-3.2 2.8-5.8 3.7-2.6.9-5.7 1.3-9.3 1.3-4.8 0-8.9-.9-12.3-2.7-3.4-1.8-6.1-4.7-8.1-8.7L74.9 83.1zM11.5 40.5H38v64.9h15.8V40.5H80V27.4H11.5v13.1z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function JavaScriptIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className}>
      <rect width="128" height="128" rx="20" fill="#F7DF1E" />
      <path
        d="M67.3 102.5c2.3 3.9 5.4 6.8 9.3 8.7 3.9 1.9 8.5 2.8 13.8 2.8 4.7 0 8.8-.8 12.3-2.4 3.5-1.6 6.2-3.9 8.1-7 1.9-3.1 2.9-6.8 2.9-11 0-3.9-.9-7.2-2.7-9.8-1.8-2.6-4.3-4.7-7.5-6.3-3.2-1.6-7.3-3-12.3-4.3-4.9-1.3-8.6-2.5-11-3.6-2.4-1.1-4.2-2.5-5.3-4.2-1.1-1.7-1.7-3.8-1.7-6.3 0-2.7.7-5 2.1-6.9 1.4-1.9 3.4-3.4 6.1-4.4s5.9-1.5 9.7-1.5c4 0 7.5.7 10.6 2.1s5.6 3.5 7.4 6.2l12.4-8c-3.1-4.6-7.4-8.1-13-10.5-5.6-2.4-12.2-3.6-19.8-3.6-6.8 0-12.8 1.1-18 3.4s-9.3 5.5-12.2 9.8c-2.9 4.3-4.3 9.4-4.3 15.3 0 5.8 1.4 10.7 4.1 14.8s6.4 7.2 11.2 9.5 10.6 4.1 17.5 5.5c4.8 1 8.4 2.1 10.8 3.1 2.4 1 4.2 2.3 5.3 3.8s1.7 3.4 1.7 5.7c0 2.4-.7 4.5-2.1 6.2s-3.5 3-6.4 3.9c-2.9.9-6.3 1.4-10.3 1.4-5.3 0-9.8-1-13.6-3-3.8-2-6.8-5.1-9-9.4l-12.6 7.8zM24.7 78.4l14.2-8.5c2.4 4.1 4.9 7 7.5 8.7 2.6 1.7 5.8 2.6 9.6 2.6 3.1 0 5.6-.6 7.5-1.9 1.9-1.3 2.8-3.2 2.8-5.8V27.4H73v47.2c0 6.6-2.1 11.8-6.4 15.6-4.3 3.8-10.5 5.7-18.6 5.7-6.2 0-11.6-1.5-16.1-4.4-4.5-2.9-7.9-7.3-10.2-13.1h3z"
        fill="#000000"
      />
    </svg>
  )
}

export function NodeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <path
        d="M64 4L11.5 34.3v60.6L64 125.2l52.5-30.3V34.3L64 4z"
        fill="#339933"
      />
      <path
        d="M64 21.6L24.3 44.5v45.8L64 113.2l39.7-22.9V44.5L64 21.6z"
        fill="#026E00"
      />
      <path
        d="M64 36.8L37.1 52.3v31l26.9 15.5 26.9-15.5v-31L64 36.8z"
        fill="#66CC33"
      />
    </svg>
  )
}

export function ExpressIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#0F172A" />
      <path
        d="M28 64c0-19.882 16.118-36 36-36s36 16.118 36 36-16.118 36-36 36-36-16.118-36-36z"
        stroke="#38BDF8"
        strokeWidth="4"
        strokeDasharray="6 6"
      />
      <path
        d="M60 40L42 66h16l-4 22 26-28H62l6-20H60z"
        fill="#38BDF8"
      />
    </svg>
  )
}

export function PythonIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <path
        d="M63.3 6.4c-28.7 0-26.9 12.4-26.9 12.4l.1 12.9h27.4v3.9H23.8s-17.4 2-17.4 27.2 15.2 26.3 15.2 26.3h9.1v-12.7s-.5-15.2 15-15.2h26.4s14.4-.2 14.4-14.1V20.5S88.7 6.4 63.3 6.4zm-14.8 8.7c2.8 0 5.1 2.3 5.1 5.1s-2.3 5.1-5.1 5.1-5.1-2.3-5.1-5.1 2.3-5.1 5.1-5.1z"
        fill="#3776AB"
      />
      <path
        d="M64.7 121.6c28.7 0 26.9-12.4 26.9-12.4l-.1-12.9H64.1v-3.9h40.1s17.4-2 17.4-27.2-15.2-26.3-15.2-26.3h-9.1v12.7s.5 15.2-15 15.2H55.9s-14.4.2-14.4 14.1v26.3s-2.2 14.1 23.2 14.1zm14.8-8.7c-2.8 0-5.1-2.3-5.1-5.1s2.3-5.1 5.1-5.1 5.1 2.3 5.1 5.1 2.3 5.1-5.1 5.1z"
        fill="#FFD43B"
      />
    </svg>
  )
}

export function LaravelIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#FF2D20" />
      <path
        d="M32 78l20 11.5L88 68V45L52 65.5 32 54v24z"
        fill="#FFFFFF"
        opacity="0.9"
      />
      <path
        d="M52 42.5L72 54l16-9.2L68 33.3 52 42.5z"
        fill="#FFFFFF"
      />
      <path
        d="M68 64.5l20-11.5 8 4.6V74L76 83.2v-14l-8-4.7z"
        fill="#FFFFFF"
        opacity="0.8"
      />
    </svg>
  )
}

export function GraphqlIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <path
        d="M64 12l45 26v52l-45 26-45-26V38l45-26z"
        stroke="#E10098"
        strokeWidth="6"
        fill="none"
      />
      <path
        d="M64 12v104M19 38l90 52M19 90l90-52"
        stroke="#E10098"
        strokeWidth="6"
      />
      <circle cx="64" cy="12" r="9" fill="#E10098" />
      <circle cx="109" cy="38" r="9" fill="#E10098" />
      <circle cx="109" cy="90" r="9" fill="#E10098" />
      <circle cx="64" cy="116" r="9" fill="#E10098" />
      <circle cx="19" cy="90" r="9" fill="#E10098" />
      <circle cx="19" cy="38" r="9" fill="#E10098" />
    </svg>
  )
}

export function ReactNativeIcon({ className = 'w-6 h-6' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <ReactIcon className="w-full h-full" />
      <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-cyan-500 text-slate-950 px-1 py-0.2 rounded font-mono">
        M
      </span>
    </div>
  )
}

export function FlutterIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <path d="M78.6 14.5L25.4 67.7l16.3 16.3 69.5-69.5H78.6z" fill="#42A5F5" />
      <path d="M78.6 67.7L54.2 92.1l16.3 16.3L111.2 67.7H78.6z" fill="#42A5F5" />
      <path d="M70.5 108.4L86.8 124.7h32.6L86.8 92.1l-16.3 16.3z" fill="#0D47A1" />
      <path d="M54.2 92.1l16.3 16.3 16.3-16.3-16.3-16.3-16.3 16.3z" fill="#1E88E5" />
    </svg>
  )
}

export function SwiftIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#F05138" />
      <path
        d="M101.4 87.2c-.4-.6-.8-1.2-1.3-1.8-6.9-8.4-18.4-14.8-23.7-18 8 9.3 10.3 18.2 10.3 18.2s-7.1-5.7-16.4-10.3c-10.7-5.3-20.7-6.2-27.4-6.3 2.9 2.5 7.7 6.1 13.9 9.3 10.5 5.4 17.6 13.6 18.1 14.2-12.7-8.3-25.3-11.8-33.8-13.3-7.5-1.3-17.1-1.3-24.9 3.5 10.8-4.5 24.3-3.6 33.6 1.4 7.6 4.1 13.8 11.2 21.6 16.8 4.6 3.3 9.7 6.1 15.6 7.8 8.1 2.3 17.3 1.2 24.8-2.6-6-2.2-11.1-6.1-15.3-11.1 7.2 1.4 15.1-.3 21.1-4.8 1.4-1 2.6-2.1 3.8-3.1z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function KotlinIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <defs>
        <linearGradient id="kotlin-grad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E24485" />
          <stop offset="50%" stopColor="#7F52FF" />
          <stop offset="100%" stopColor="#00AFFF" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="24" fill="url(#kotlin-grad)" />
      <path d="M128 0H0v128h128L64 64l64-64z" fill="url(#kotlin-grad)" />
      <path d="M64 64L0 128h128L64 64z" fill="#00AFFF" />
      <path d="M0 0l64 64L128 0H0z" fill="#E24485" />
    </svg>
  )
}

export function PostgresIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#336791" />
      <path
        d="M64 26c-17.6 0-30.8 11.2-32.9 27.5-1.5 11.4 3.7 21.5 11.6 27.2l-2.2 13.8 14.5-8.2c2.9.7 6 1.1 9 1.1 19.3 0 34.6-13.5 34.6-31.2S83.3 26 64 26zm14.5 35.8c-2.3 4.8-6.7 8.3-12 9.5l3.2 8.6-8.9-5.1c-1.8.2-3.7.3-5.6.3-12.8 0-23.2-8.3-23.2-18.5 0-10.2 10.4-18.5 23.2-18.5 12.8 0 23.2 8.3 23.2 18.5 0 2-.4 3.9-1.2 5.7l1.3-.5z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function MongoDbIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <path
        d="M64 12C63.2 13.2 50.8 30.6 50.8 59c0 23.4 10.4 39.4 12.7 42.6.4.6.9 1 1.5 1.2V12z"
        fill="#47A248"
      />
      <path
        d="M64 12C64.8 13.2 77.2 30.6 77.2 59c0 23.4-10.4 39.4-12.7 42.6-.4.6-.9 1-1.5 1.2V12z"
        fill="#499D4A"
      />
      <path
        d="M64 116v-13.2c-1.5.2-3 .5-4.5.9.8 3.8 2.6 8.3 4.5 12.3zm0 0v-13.2c1.5.2 3 .5 4.5.9-.8 3.8-2.6 8.3-4.5 12.3z"
        fill="#3FA037"
      />
    </svg>
  )
}

export function RedisIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#DC382D" />
      <path
        d="M64 36l34 16-34 16-34-16 34-16z"
        fill="#FFFFFF"
      />
      <path
        d="M30 57l34 16v24L30 81V57z"
        fill="#FFFFFF"
        opacity="0.85"
      />
      <path
        d="M64 73l34-16v24l-34 16V73z"
        fill="#FFFFFF"
        opacity="0.7"
      />
      <circle cx="58" cy="48" r="3" fill="#DC382D" />
      <circle cx="70" cy="48" r="3" fill="#DC382D" />
    </svg>
  )
}

export function DockerIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#2496ED" />
      <path
        d="M108 66c-1.4-.9-4.8-1.4-7.4-.7-.4-2.8-2.4-5.2-5.3-6.1-5.7-1.8-11.7 1.4-14.2 6.8H20v14c0 14.4 11.6 26 26 26 21 0 38.6-12.8 45.3-30.8 7.3.3 13.9-3.4 16.7-9.2z"
        fill="#FFFFFF"
      />
      <rect x="36" y="52" width="10" height="10" rx="1.5" fill="#FFFFFF" />
      <rect x="49" y="52" width="10" height="10" rx="1.5" fill="#FFFFFF" />
      <rect x="62" y="52" width="10" height="10" rx="1.5" fill="#FFFFFF" />
      <rect x="49" y="39" width="10" height="10" rx="1.5" fill="#FFFFFF" />
      <rect x="62" y="39" width="10" height="10" rx="1.5" fill="#FFFFFF" />
      <rect x="62" y="26" width="10" height="10" rx="1.5" fill="#FFFFFF" />
    </svg>
  )
}

export function AwsIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#232F3E" />
      <path
        d="M40.2 61.2c0-5.8 4.1-9.2 11.2-9.2 4.1 0 7.4 1.1 9.4 2.2v-3.7c0-3.8-2.5-5.9-7.2-5.9-3.8 0-6.7 1.3-8.8 2.6l-2-4.1c2.8-1.8 6.9-3.2 12-3.2 8.1 0 13.1 4.2 13.1 11.7v18.7h-6.7v-3.4c-2.2 2.2-5.8 3.8-10.2 3.8-6.8 0-10.8-4.2-10.8-9.5zm20.6-1.5v-2.2c-1.8-1-4.7-1.7-7.7-1.7-4.4 0-6.9 1.9-6.9 4.9 0 2.9 2.2 4.9 6.3 4.9 4.2 0 8.3-2.3 8.3-5.9z"
        fill="#FFFFFF"
      />
      <path
        d="M34 85c19 11.4 44 11.1 60-1.8.8-.7.4-1.8-.6-1.5-14.7 4.7-37 4.7-58.8-5.8-.8-.4-1.4.3-.6.9l0 .2z"
        fill="#FF9900"
      />
      <path
        d="M96 79.5c-1.5 2.1-4.9 4.8-7.7 6.4-.4.2-.2.8.3.7 3.6-.8 9.5-1.5 11.8-1.5 1.1 0 1.3-.8.3-1.4-2-1.3-4.1-3.6-4.7-4.2z"
        fill="#FF9900"
      />
    </svg>
  )
}

export function FirebaseIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <path
        d="M26.2 92.4L39.8 13.8c.4-2.5 3.6-3.4 5.3-1.5l22.2 25.1-41.1 55z"
        fill="#FFA000"
      />
      <path
        d="M26.2 92.4l75.6-70.8c2-1.9 5.3-.6 5.5 2.2l12.1 76.5-93.2-7.9z"
        fill="#F57C00"
      />
      <path
        d="M72.5 114.2l47-26.2-12.1-76.4c-.2-2.8-3.5-4.1-5.5-2.2L26.2 92.4l46.3 21.8z"
        fill="#FFCA28"
      />
    </svg>
  )
}

export function ShopifyIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#95BF47" />
      <path
        d="M87.8 33.5s-1.8-.7-4.4-.7c-4 0-8.2 2.8-11.4 7.6-2.4 3.7-4.3 8.7-5.5 13.6h-9.9c-.8 0-1.5.7-1.5 1.5 0 .8.7 1.5 1.5 1.5h8.9c-.3 2.1-.5 4.3-.5 6.4 0 2.2.1 4.3.4 6.4H50c-.8 0-1.5.7-1.5 1.5 0 .8.7 1.5 1.5 1.5h16.7c3.4 12.1 11.2 20.8 19.3 20.8 1.8 0 3.5-.4 4.9-1.2l-3.2-2.8c-.8.5-1.9.7-2.9.7-6.5 0-12.7-8.1-15.5-19h13.7c.8 0 1.5-.7 1.5-1.5 0-.8-.7-1.5-1.5-1.5H68.3c-.2-2.1-.3-4.2-.3-6.4 0-2.2.1-4.3.4-6.4h17.9c.8 0 1.5-.7 1.5-1.5 0-.8-.7-1.5-1.5-1.5H69.4c1.1-4.2 2.7-8.4 4.7-11.6 2.5-3.8 5.7-5.9 8.7-5.9 1.9 0 3.2.5 3.2.5l1.8-3.5z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function WordPressIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#21759B" />
      <path
        d="M64 20C39.7 20 20 39.7 20 64s19.7 44 44 44 44-19.7 44-44-19.7-44-44-44zm0 82.5c-7.9 0-15.3-2.3-21.5-6.3L59.7 50.8l17.8 48.7c-4.2 2-8.8 3-13.5 3zm29.3-19.6L79.1 60.4l8.3-24.3c2.7 4.1 4.5 8.8 5.2 13.9.7 5.1.4 10.3-.7 15.2l1.4 17.7zm-60.6-39c2.4-3.8 5.7-7 9.5-9.2L30.9 76.5c-2-4.1-3.1-8.7-3.1-13.5 0-7.1 2.3-13.8 4.9-19.1zM64 25.5c4.7 0 9.2.9 13.3 2.5L62.7 67.2 49.3 28.5c4.6-2 9.5-3 14.7-3z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function WooCommerceIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="none">
      <rect width="128" height="128" rx="24" fill="#96588A" />
      <path
        d="M34 50c0-6.6 5.4-12 12-12s12 5.4 12 12v28c0 6.6-5.4 12-12 12s-12-5.4-12-12V50zm36 0c0-6.6 5.4-12 12-12s12 5.4 12 12v28c0 6.6-5.4 12-12 12s-12-5.4-12-12V50z"
        fill="#FFFFFF"
        opacity="0.9"
      />
      <circle cx="46" cy="62" r="5" fill="#96588A" />
      <circle cx="82" cy="62" r="5" fill="#96588A" />
    </svg>
  )
}
