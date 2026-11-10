import { AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import type { DashboardAlertItem } from '../../types/admin.types';

interface RecentAlertsWidgetProps {
  readonly alerts: readonly DashboardAlertItem[];
  readonly onViewUsers: () => void;
}

const ALERT_STYLE_MAP = {
  info: {
    icon: Bell,
    boxClass: 'border-blue-800/70 bg-blue-950/70 text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    boxClass: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
  },
  success: {
    icon: CheckCircle2,
    boxClass: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
  },
} as const;

/**
 * Operational alerts feed rendered strictly with clean monochrome/blue SVG icons.
 */
export function RecentAlertsWidget({
  alerts,
  onViewUsers,
}: RecentAlertsWidgetProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            Últimas Alertas
          </h3>
          <button
            type="button"
            onClick={onViewUsers}
            className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            Ver módulo
          </button>
        </div>

        <div className="space-y-3.5">
          {alerts.map((alert) => {
            const style = ALERT_STYLE_MAP[alert.tone];
            const Icon = style.icon;
            return (
              <div key={alert.id} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${style.boxClass}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-snug text-slate-200">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {alert.detail} &middot; {alert.timeLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
