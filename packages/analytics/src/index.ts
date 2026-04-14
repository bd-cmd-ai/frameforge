import type { AnalyticsEventInput } from "@radar-domace/types";

export interface AnalyticsAdapter {
  track: (event: AnalyticsEventInput) => Promise<void>;
}

export const consoleAnalyticsAdapter: AnalyticsAdapter = {
  async track(event) {
    console.info("[analytics]", event.eventName, event);
  },
};

export const createAnalyticsClient = (adapter: AnalyticsAdapter = consoleAnalyticsAdapter) => ({
  track: (event: AnalyticsEventInput) => adapter.track(event),
});
