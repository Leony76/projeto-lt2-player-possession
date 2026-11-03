
import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes} from "react-icons/fa";
import styles from "./css/Toast.module.css";
import type { ToastType } from "@/types/toast.type";

export interface ToastProps {
  type      : ToastType;
  message   : string;
  duration ?: number;
  onClose  ?: () => void;
}

const Toast = ({
  type,
  message,
  duration = 5000,
  onClose,
}: ToastProps): React.JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const toastConfig = {
    SUCCESS: {
      title: "Success",
      Icon: FaCheckCircle,
    },
    ERROR: {
      title: "Error",
      Icon: FaTimesCircle,
    },
    INFO: {
      title: "Information",
      Icon: FaInfoCircle,
    },
    WARNING: {
      title: "Warning",
      Icon: FaExclamationTriangle,
    },
  };

  useEffect(() => {
    const enterTimer = window.setTimeout(() => {
      setVisible(true);
    }, 20);

    const closeTimer = window.setTimeout(() => {
      setClosing(true);
    }, duration);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (
      closing &&
      event.target === event.currentTarget &&
      event.propertyName === "transform"
    ) {
      onClose?.();
    }
  };

  const { title, Icon } = toastConfig[type];

  return (
    <div
    className={[
      styles.toast,
      styles[type],
      visible && !closing ? styles.visible : "",
      closing ? styles.closing : "",
    ].filter(Boolean).join(" ")}
    role={type === "ERROR" ? "alert" : "status"}
    aria-live={type === "ERROR" || type === "WARNING" ? "assertive" : "polite"}
    onTransitionEnd={handleTransitionEnd}
    >
      <div className={styles.icon_title_message_container}>
        <div className={styles.icon_title_container}>
          <Icon className={styles.icon} />

          <strong className={styles.title}>
            { title }
          </strong>
        </div>

        <p className={styles.message}>
          { message} 
        </p>
      </div>

      <button
      type="button"
      className={styles.closeButton}
      aria-label="Close notification"
      onClick={() => setClosing(true)}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
