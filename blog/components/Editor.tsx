import EditorJs from "react-editor-js";
import EditorJS, { OutputData, LogLevels, API } from "@editorjs/editorjs";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import List from "@editorjs/list";
import Warning from "@editorjs/warning";
import Code from "@editorjs/code";
import LinkTool from "@editorjs/link";
import Image from "@editorjs/image";
import Raw from "@editorjs/raw";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import CheckList from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import SimpleImage from "@editorjs/simple-image";
import {
  uploadByFileService,
  uploadByUrlService,
} from "../lib/services/file.service";

const EDITOR_JS_TOOLS = {
  embed: Embed,
  table: Table,
  marker: Marker,
  list: List,
  warning: Warning,
  code: Code,
  linkTool: LinkTool,
  image: {
    class: Image,
    config: {
      uploader: {
        /**
         * @description 提交文件上传
         * @author Saxon
         * @date 2020-05-05
         * @param {File} file
         * @returns 
         */
        async uploadByFile(file: File) {
          const formData = new FormData();
          formData.append("image", file);
          const { results } = await uploadByFileService({
            data: formData,
          });
          return {
            success: 1,
            file: {
              url: results.url,
              id: results.id,
            },
          };
        },
        /**
         * @description 粘贴url上传
         * @author Saxon
         * @date 2020-05-05
         * @param {string} url
         * @returns 
         */
        async uploadByUrl(url: string) {
          const { results } = await uploadByUrlService({
            data: { url },
          });
          return {
            success: 1,
            file: {
              url: results.url,
              id: results.id,
            },
          };
        },
      },
    },
  },
  raw: Raw,
  header: { class: Header, inlineToolbar: true },
  quote: Quote,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  simpleImage: SimpleImage,
};

type Props = {
  instanceRef?: (instance: EditorJS) => void;
  data: OutputData;
  onReady?: () => void;
  onChange?: (api: API) => void;
  placeholder?: string | false;
};

const Editor: React.FunctionComponent<Props> = ({
  instanceRef,
  data,
  onReady,
  onChange,
  placeholder,
}) => {
  return (
    <EditorJs
      instanceRef={instanceRef}
      tools={EDITOR_JS_TOOLS}
      data={data}
      placeholder={placeholder}
      onReady={onReady}
      onChange={onChange}
      logLevel={
        process.env.NODE_ENV === "development"
          ? LogLevels?.VERBOSE || "VERBOSE"
          : LogLevels?.ERROR || "ERROR"
      }
    />
  );
};

export default Editor;
