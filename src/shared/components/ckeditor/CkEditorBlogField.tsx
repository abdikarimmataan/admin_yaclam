"use client";

import { useMemo, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { createBlogUploadAdapterPlugin } from "@/shared/components/ckeditor/createBlogUploadAdapter";
import { plainTextToEditorHtml } from "@/shared/utils/html-content";

export type CkEditorBlogFieldProps = {
  editorKey: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  onUploadImage: (file: File) => Promise<string>;
};

const BLOG_EDITOR_PLUGINS = [
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  BlockQuote,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Table,
  TableToolbar,
  MediaEmbed,
  Alignment,
  Indent,
  IndentBlock,
  HorizontalLine,
  Autoformat,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  GeneralHtmlSupport,
  CodeBlock,
  Highlight,
  FontSize,
  FontColor,
  FontBackgroundColor,
  Undo,
];

export default function CkEditorBlogField({
  editorKey,
  value,
  onChange,
  placeholder = "Write your article…",
  error,
  onUploadImage,
}: CkEditorBlogFieldProps) {
  const initialData = useRef(plainTextToEditorHtml(value));

  const editorConfig = useMemo(
    () => ({
      licenseKey: "GPL" as const,
      plugins: [...BLOG_EDITOR_PLUGINS, createBlogUploadAdapterPlugin(onUploadImage)],
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "|",
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "highlight",
          "|",
          "alignment",
          "|",
          "bulletedList",
          "numberedList",
          "outdent",
          "indent",
          "|",
          "link",
          "uploadImage",
          "mediaEmbed",
          "insertTable",
          "blockQuote",
          "codeBlock",
          "horizontalLine",
          "|",
          "removeFormat",
          "sourceEditing",
        ],
        shouldNotGroupWhenFull: true,
      },
      heading: {
        options: [
          { model: "paragraph" as const, title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading2" as const, view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
          { model: "heading3" as const, view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
          { model: "heading4" as const, view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
        ],
      },
      image: {
        toolbar: [
          "imageStyle:inline",
          "imageStyle:block",
          "imageStyle:side",
          "|",
          "toggleImageCaption",
          "imageTextAlternative",
        ],
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
      mediaEmbed: {
        previewsInData: true,
      },
      placeholder,
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
      },
    }),
    [onUploadImage, placeholder]
  );

  const borderClass = error ? "border-red-400" : "border-slate-300";

  return (
    <div>
      <div
        className={`blog-ck-editor overflow-hidden rounded-lg border bg-white shadow-sm ${borderClass} [&_.ck-editor__editable]:min-h-[320px] [&_.ck-editor__top]:border-slate-200 [&_.ck-toolbar]:border-slate-200 [&_.ck-toolbar]:bg-slate-50`}
      >
        <CKEditor
          id={editorKey}
          editor={ClassicEditor}
          data={initialData.current}
          config={editorConfig}
          onChange={(_event, editor) => onChange(editor.getData())}
        />
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
