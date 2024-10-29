import { IncomingMessage } from "http";
import { URL } from "url";
import { ParsedRequest, FileType, Theme } from "./types";

/**
 * HTTP 요청을 파싱하여 ParsedRequest 객체를 생성합니다.
 * @param req IncomingMessage 객체
 * @returns ParsedRequest 객체
 * @throws 요청 URL이 없거나 잘못된 형식일 경우 오류를 던집니다.
 */
export function parseRequest(req: IncomingMessage): ParsedRequest {
  const urlString = req.url ? `http://${req.headers.host}${req.url}` : null;

  if (!urlString) {
    throw new Error("Request URL is undefined");
  }

  console.log("HTTP " + req.url);

  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    throw new Error("Invalid URL format");
  }

  const searchParams = url.searchParams;

  const fontSize = searchParams.get("fontSize") || "96px";
  const images = getArray(searchParams.getAll("images"));
  const widths = getArray(searchParams.getAll("widths"));
  const heights = getArray(searchParams.getAll("heights"));
  const themeParam = searchParams.get("theme") || "light";
  const mdParam = searchParams.get("md") || "false";

  // theme과 fontSize에 대한 유효성 검사
  const theme: Theme = themeParam.toLowerCase() === "dark" ? "dark" : "light";

  const md: boolean = ["1", "true"].includes(mdParam.toLowerCase());

  const { text, fileType } = parsePathname(url.pathname);

  const parsedRequest: ParsedRequest = {
    fileType,
    text: decodeURIComponent(text),
    theme,
    md,
    fontSize,
    images,
    widths,
    heights,
  };

  return parsedRequest;
}

/**
 * pathname을 파싱하여 텍스트와 파일 타입을 추출합니다.
 * @param pathname URL의 pathname 부분
 * @returns 텍스트와 파일 타입 객체
 */
function parsePathname(pathname: string): { text: string; fileType: FileType } {
  const segments = pathname.replace(/^\/+/, "").split(".");
  const extension = segments.length > 1 ? segments.pop()!.toLowerCase() : "png";
  const text = segments.join(".") || "";

  const validFileTypes: FileType[] = ["png", "jpeg"];
  const fileType: FileType = validFileTypes.includes(extension as FileType)
    ? (extension as FileType)
    : "png";

  return { text, fileType };
}

/**
 * 문자열 배열을 반환합니다. 입력이 단일 문자열일 경우 배열로 변환합니다.
 * @param values 문자열 배열 또는 단일 문자열
 * @returns 문자열 배열
 */
function getArray(values: string[]): string[] {
  return values;
}
