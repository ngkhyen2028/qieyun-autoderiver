import { css as stylesheet } from "@emotion/css";

import Swal from "./Classes/SwalReact";
import Spinner from "./Components/Spinner";

import type { SweetAlertOptions } from "sweetalert2";

const loadingModal = stylesheet`
  display: flex !important;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin: 1rem;
  overflow: unset;
`;

export function showLoadingDialog(msg: string, abortController: AbortController) {
  Swal.fire({
    title: "載入中",
    html: (
      <>
        <div>{msg}</div>
        <Spinner />
      </>
    ),
    customClass: {
      htmlContainer: loadingModal,
    },
    allowOutsideClick: false,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "取消",
  }).then(result => result.dismiss === Swal.DismissReason.cancel && abortController.abort());
}

const errorModal = stylesheet`
  width: 60vw;
  display: block !important;
  p {
    margin: 0;
  }
  pre {
    text-align: left;
    overflow: auto;
    max-height: calc(max(100vh - 24em, 7em));
  }
`;

export function notifyError(msg: string, err?: unknown) {
  let technical: string | null = null;
  if (typeof err === "string") {
    technical = err;
  } else if (err instanceof Error) {
    technical = err.message;
    let curErr: Error = err;
    while (curErr.cause instanceof Error) {
      curErr = curErr.cause;
      technical += "\n" + curErr.message;
    }
    if (curErr.stack) {
      technical += "\n\n" + curErr.stack;
    }
  }
  const config: SweetAlertOptions = {
    icon: "error",
    title: "錯誤",
    text: msg,
    confirmButtonText: "確定",
  };
  if (technical !== null) {
    config.customClass = errorModal;
    config.html = (
      <>
        <p>{msg}</p>
        <pre lang="en-x-code">{technical}</pre>
      </>
    );
  } else {
    config.text = msg;
  }
  Swal.fire(config);
  return new Error(msg, err instanceof Error ? { cause: err } : {});
}

export async function fetchFile(input: string) {
  try {
    const response = await fetch(input, { cache: "no-cache" });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return text;
  } catch (err) {
    throw notifyError("載入檔案失敗", err);
  }
}

export function normalizeFileName(name: string) {
  return name.replace(/\.js$/, "").trim();
}

export function memoize<T extends PropertyKey, R>(fn: (arg: T) => R) {
  const results: Record<PropertyKey, R> = {};
  return (arg: T) => {
    if (arg in results) return results[arg];
    return (results[arg] = fn(arg));
  };
}
