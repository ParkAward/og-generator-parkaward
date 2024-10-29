import { IncomingMessage, ServerResponse } from "http";
import { parseRequest } from "./_lib/parser";
import { getScreenshot } from "./_lib/chromium";
import { getHtml } from "./_lib/template";

// 환경 설정
const isDev: boolean = !process.env.AWS_REGION;
const isHtmlDebug: boolean = process.env.OG_HTML_DEBUG === "1";

/**
 * HTTP 요청을 처리하는 핸들러 함수
 * @param req IncomingMessage 객체
 * @param res ServerResponse 객체
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    // 요청 파싱
    const parsedReq = parseRequest(req);
    const html = getHtml(parsedReq);

    if (isHtmlDebug) {
      // 디버그 모드: HTML을 직접 반환
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
      return;
    }

    const { fileType } = parsedReq;

    // 스크린샷 생성
    const file: Buffer = await getScreenshot(html, fileType, isDev);

    // 응답 헤더 설정
    res.writeHead(200, {
      "Content-Type": `image/${fileType}`,
      "Cache-Control":
        "public, immutable, no-transform, s-maxage=31536000, max-age=31536000",
    });

    // 이미지 데이터 전송
    res.end(file);
  } catch (error) {
    // 에러 처리
    console.error("Error processing request:", error);
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
  }
}
