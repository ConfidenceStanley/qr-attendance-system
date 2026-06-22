import { useEffect } from "react";
import { HiOutlineX } from "react-icons/hi";

/**
 * Reusable Modal Component
 *
 * Props:
 * - isOpen: boolean - controls visibility
 * - onClose: function - called when user closes modal
 * - title: string - modal heading
 * - subtitle: string (optional) - smaller text under title
 * - children: ReactNode - modal body content
 * - size: "sm" | "md" | "lg" - controls width
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}) => {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Don't render anything if closed
  if (!isOpen) return null;

  // Map size to actual width
  const sizeMap = {
    sm: "400px",
    md: "560px",
    lg: "720px",
    xl: "920px",
  };

  return (
    <div
      // Backdrop overlay
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose} // close when clicking outside
    >
      <div
        // Modal box
        onClick={(e) => e.stopPropagation()} // dont close on inside click
        style={{
          background: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: sizeMap[size],
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid #e4e4e7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#18181b",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#71717a",
                  margin: "4px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid #e4e4e7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#71717a",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fafafa";
              e.currentTarget.style.color = "#18181b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#71717a";
            }}
          >
            <HiOutlineX size={16} />
          </button>
        </div>

        {/* Body - scrollable if content too tall */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;