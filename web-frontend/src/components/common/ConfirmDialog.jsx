import Modal from "./Modal";
import Button from "./Button";
import { HiOutlineExclamation } from "react-icons/hi";

/**
 * Confirmation Dialog
 * Used for destructive actions like delete/deactivate
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function (called on cancel)
 * - onConfirm: function (called on confirm)
 * - title: string
 * - message: string
 * - confirmText: string (default "Confirm")
 * - cancelText: string (default "Cancel")
 * - variant: "danger" | "warning" (default "danger")
 * - loading: boolean
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  // Color scheme based on variant
  const colorMap = {
    danger: {
      icon: "#f43f5e",
      bg: "rgba(244,63,94,0.1)",
    },
    warning: {
      icon: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
  };

  const colors = colorMap[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      {/* Custom content - we override default modal layout */}
      <div style={{ textAlign: "center", padding: "8px 0 0" }}>
        {/* Warning icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <HiOutlineExclamation size={28} color={colors.icon} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#18181b",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            fontSize: "14px",
            color: "#71717a",
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;