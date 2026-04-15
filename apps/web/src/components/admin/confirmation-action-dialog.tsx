"use client";

export const ConfirmationActionDialog = ({
  label,
  confirmLabel,
  onConfirm,
  variant = "ghost-button",
  disabled = false,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  variant?: string;
  disabled?: boolean;
}) => (
  <button
    className={variant}
    type="button"
    disabled={disabled}
    onClick={async () => {
      if (!window.confirm(confirmLabel)) return;
      await onConfirm();
    }}
  >
    {label}
  </button>
);
