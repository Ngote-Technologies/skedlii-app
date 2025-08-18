// Animation utility classes and configurations
export const animations = {
  // Entry animations
  fadeIn: 'animate-in fade-in duration-500',
  slideInFromLeft: 'animate-in slide-in-from-left-4 duration-400',
  slideInFromRight: 'animate-in slide-in-from-right-4 duration-400',
  slideInFromBottom: 'animate-in slide-in-from-bottom-4 duration-400',
  slideInFromTop: 'animate-in slide-in-from-top-4 duration-400',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  
  // Hover animations
  hoverScale: 'hover:scale-[1.02] transition-transform duration-200',
  hoverScaleSmall: 'hover:scale-[1.01] transition-transform duration-150',
  hoverLift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
  hoverGlow: 'hover:shadow-lg hover:shadow-primary/25 transition-all duration-300',
  
  // Button animations
  buttonPress: 'active:scale-[0.98] transition-transform duration-100',
  buttonHover: 'hover:scale-[1.05] hover:shadow-lg transition-all duration-200',
  
  // Loading animations
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  
  // Stagger animations for lists
  stagger: {
    item: (index: number) => ({
      style: { animationDelay: `${index * 100}ms` },
      className: 'animate-in fade-in slide-in-from-bottom-2 duration-400'
    })
  }
};

// Custom animation keyframes that can be added to globals.css
export const customAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(var(--primary), 0.5); }
    50% { box-shadow: 0 0 20px rgba(var(--primary), 0.8); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes wiggle {
    0%, 7%, 14%, 21% { transform: rotate(0deg); }
    3.5%, 10.5%, 17.5% { transform: rotate(-3deg); }
    7%, 14%, 21% { transform: rotate(3deg); }
  }
  
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite alternate; }
  .animate-shimmer { animation: shimmer 2s infinite; }
  .animate-wiggle { animation: wiggle 1s ease-in-out; }
`;

// Utility function to create staggered animations
export function createStaggeredAnimation(items: any[], baseDelay = 50) {
  return items.map((item, index) => ({
    ...item,
    style: {
      ...item.style,
      animationDelay: `${index * baseDelay}ms`
    },
    className: `${item.className || ''} animate-in fade-in slide-in-from-bottom-1 duration-300`.trim()
  }));
}

// Hover effect configurations
export const hoverEffects = {
  card: 'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300',
  button: 'hover:scale-[1.05] hover:shadow-md active:scale-[0.98] transition-all duration-200',
  icon: 'hover:scale-110 hover:rotate-12 transition-all duration-200',
  lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200'
};

// Focus ring utilities
export const focusRings = {
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  primary: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  inset: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary'
};