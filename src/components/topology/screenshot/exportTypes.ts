import type {Options as HTMLToImageOptions} from "html-to-image/es/types";
import type {Ref} from "vue";

export type ImageType = "png";

export interface UseScreenshotOptions extends HTMLToImageOptions {
  type?: ImageType;
  fileName?: string;
  shouldDownload?: boolean;
  fetchRequestInit?: RequestInit;
}

export type CaptureScreenshot = (
  el: HTMLElement,
  options?: UseScreenshotOptions
) => Promise<string>;

export type Download = (fileName: string) => void;

export interface UseScreenshot {
  capture: CaptureScreenshot;
  download: Download;
  dataUrl: Ref<string>;
  error: Ref;
}
