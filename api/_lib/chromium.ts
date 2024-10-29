import puppeteer, { Browser, Page, ScreenshotOptions } from "puppeteer-core";
import { getOptions } from "./options";
import { FileType } from "./types";

let browser: Browser | null = null;
let page: Page | null = null;

/**
 * 브라우저 인스턴스를 초기화하고 페이지를 생성합니다.
 * @param isDev 개발 모드 여부
 * @returns 페이지 인스턴스
 */
async function initializePage(isDev: boolean): Promise<Page> {
  if (browser === null) {
    const options = await getOptions(isDev);
    browser = await puppeteer.launch(options);
  }

  if (page === null) {
    page = await browser.newPage();
    // 페이지 이벤트 핸들링 (예: 에러 로깅) 추가 가능
    page.on("error", (err) => {
      console.error("Page error:", err);
      // 필요시 페이지 재생성 로직 추가
    });
  }

  return page;
}

/**
 * HTML 내용을 기반으로 스크린샷을 생성합니다.
 * @param html HTML 문자열
 * @param type 파일 타입 (예: 'png', 'jpeg')
 * @param isDev 개발 모드 여부
 * @returns 스크린샷 버퍼
 */
export async function getScreenshot(
  html: string,
  type: FileType,
  isDev: boolean
): Promise<Buffer> {
  try {
    const currentPage = await initializePage(isDev);
    await currentPage.setViewport({ width: 2048, height: 1170 });
    await currentPage.setContent(html, { waitUntil: "networkidle0" });

    const screenshotOptions: ScreenshotOptions = {
      type,
      fullPage: true, // 전체 페이지 스크린샷
    };

    // 파일 타입에 따른 추가 옵션 설정
    if (type === "jpeg") {
      screenshotOptions.quality = 80; // JPEG 품질 설정 (1-100)
    }

    const fileBuffer = await currentPage.screenshot(screenshotOptions);
    return fileBuffer;
  } catch (error) {
    console.error("스크린샷 생성 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 프로세스 종료 시 브라우저를 안전하게 닫습니다.
 */
async function closeBrowser() {
  if (browser !== null) {
    await browser.close();
    browser = null;
    page = null;
  }
}

// 프로세스 종료 시 브라우저 닫기
process.on("exit", closeBrowser);
process.on("SIGINT", closeBrowser);
process.on("SIGTERM", closeBrowser);
