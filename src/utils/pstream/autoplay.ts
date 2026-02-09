import { isExtensionActiveCached } from "src/backend/pstream/extension/messaging";
import { conf } from "@/setup/config";
import { useAuthStore } from "src/stores/auth";

export function isAutoplayAllowed() {
  return Boolean(
    conf().ALLOW_AUTOPLAY ||
      isExtensionActiveCached() ||
      useAuthStore.getState().proxySet,
  );
}
