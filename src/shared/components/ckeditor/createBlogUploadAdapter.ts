import type { Editor, FileLoader } from "ckeditor5";
import { resolveAssetUrl } from "@/shared/utils/asset-url";

export function createBlogUploadAdapterPlugin(uploadImage: (file: File) => Promise<string>) {
  return function BlogUploadAdapterPlugin(editor: Editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader: FileLoader) => ({
      upload: async () => {
        const file = await loader.file;
        if (!file) throw new Error("No image file selected");
        const path = await uploadImage(file);
        return { default: resolveAssetUrl(path) };
      },
      abort: () => {},
    });
  };
}
