import { useEffect } from "react";

import { updateSettings } from "src/backend/pstream/accounts/settings";
import { useBackendUrl } from "src/hooks/pstream/auth/useBackendUrl";
import { useAuthStore } from "src/stores/auth";
import { useSubtitleStore } from "src/stores/subtitles";

const syncIntervalMs = 5 * 1000;

export function SettingsSyncer() {
  const importSubtitleLanguage = useSubtitleStore(
    (s) => s.importSubtitleLanguage,
  );
  const url = useBackendUrl();

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        if (!url) return;
        const state = useSubtitleStore.getState();
        const user = useAuthStore.getState();
        if (state.lastSync.lastSelectedLanguage === state.lastSelectedLanguage)
          return; // only sync if there is a difference
        if (!user.account) return;
        if (!state.lastSelectedLanguage) return;
        await updateSettings(url, user.account, {
          defaultSubtitleLanguage: state.lastSelectedLanguage,
        });
        importSubtitleLanguage(state.lastSelectedLanguage);
      })();
    }, syncIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [importSubtitleLanguage, url]);

  return null;
}
