export default function Wave() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 translate-y-[1px]">
      <svg
        className="relative block w-full h-[60px] md:h-[120px] lg:h-[180px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        {/* Warna fill ini menyesuaikan background section Features (slate-50 = #f8fafc) */}
        <path
          fill="#f8fafc"
          fillOpacity="1"
          d="M0,224L60,229.3C120,235,240,245,360,240C480,235,600,213,720,192C840,171,960,149,1080,154.7C1200,160,1320,192,1380,208L1440,224V320H0Z"
        ></path>
      </svg>
    </div>
  )
}