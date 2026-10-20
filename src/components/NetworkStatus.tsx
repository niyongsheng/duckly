import { useI18n } from "../i18n/config";
import { usePWA } from "../hooks/usePWA";

export default function NetworkStatus() {
  const { t } = useI18n();
  const { isOffline } = usePWA();

  return (
    <div className="network-badge">
      <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
        {isOffline ? (
          <>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="var(--coral)" />
            <path d="M8 8l8 8M16 8l-8 8" stroke="var(--text-on-accent)" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="var(--cyan)" />
            <path
              d="M9 12l2 2 4-4"
              stroke="var(--text-on-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
      {isOffline ? t("network.offline") : t("network.online")}
    </div>
  );
}
