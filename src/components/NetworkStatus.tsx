import { useI18n } from "../i18n/config";
import { usePWA } from "../hooks/usePWA";

export default function NetworkStatus() {
  const { t } = useI18n();
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="network-badge">
      <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="var(--coral)" />
        <path d="M8 8l8 8M16 8l-8 8" stroke="var(--text-on-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {t("network.offline")}
    </div>
  );
}
