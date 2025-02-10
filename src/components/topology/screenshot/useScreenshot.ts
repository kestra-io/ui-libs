import {toPng as ElToPng} from "html-to-image";
import {ref} from "vue";
import type {Options as HTMLToImageOptions} from "html-to-image/es/types";
import type {ImageType, UseScreenshot, UseScreenshotOptions} from "./exportTypes";

export function useScreenshot(): UseScreenshot {
    const dataUrl = ref<string>("");
    const imgType = ref<ImageType>("png");
    const error = ref();

    async function capture(el: HTMLElement, options: UseScreenshotOptions = {}) {
        let data;

        const fileName = options.fileName ?? `Flow-${Date.now()}`;

        switch (options.type) {
            case "png":
                data = await toPng(el, options);
                break;
            default:
                data = await toPng(el, options);
                break;
        }

        if (options.shouldDownload && fileName !== "") {
            download(fileName);
        }

        return data;
    }

    function toPng(
        el: HTMLElement,
        options: HTMLToImageOptions = {quality: 1}
    ) {
        error.value = null;

        return ElToPng(el, options)
            .then((data) => {
                dataUrl.value = data;
                imgType.value = "png";
                return data;
            })
            .catch((error) => {
                error.value = error;
                throw new Error(error);
            });
    }

    function download(fileName: string) {
        const link = document.createElement("a");
        link.download = `${fileName}.${imgType.value}`;
        link.href = dataUrl.value;
        link.click();
    }

    return {
        capture,
        download,
        dataUrl,
        error,
    };
}
