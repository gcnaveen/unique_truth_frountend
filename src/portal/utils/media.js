import { normalizeMediaList, unwrapApiPayload } from "../../counsellor/utils/upload";
import { canDownloadPortalMedia } from "./access";

export const parsePortalMediaList = (response, paymentContext) => {
  const payload = unwrapApiPayload(response);
  const canDownload = canDownloadPortalMedia(response, paymentContext);
  return {
    items: normalizeMediaList(response),
    canDownload,
    paymentRequired: payload?.paymentRequired === true || !canDownload,
  };
};

export const getPortalMediaItemLabel = (item, index, fallbackPrefix) =>
  item?.label ||
  item?.originalName ||
  item?.fileName ||
  item?.filename ||
  `${fallbackPrefix} ${index + 1}`;
