import { useScrollToTop } from "../hooks/useScrollToTop";

const ScrollToTopButton = () => {
  const { isVisible, scrollToTop } = useScrollToTop();

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed p-2 text-white transition-all duration-300 rounded-full shadow-lg bottom-4 right-4 bg-stone-800 hover:bg-stone-700"
        aria-label="Scroll to top"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    )
  );
};

export default ScrollToTopButton; 