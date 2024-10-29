import { readFileSync } from "fs";
import { sanitizeHtml } from "./sanitizer";
import { ParsedRequest, Theme } from "./types";
const twemoji = require("twemoji");

// Twemoji 옵션 설정
const twOptions = { folder: "svg", ext: ".svg" };
const emojify = (text: string) => twemoji.parse(text, twOptions);

// 폰트 파일을 비동기적으로 읽고 캐싱합니다.
let fonts: { regular: string; bold: string } | null = null;

function loadFonts() {
  if (!fonts) {
    fonts = {
      regular: readFileSync(
        `${__dirname}/../_fonts/Pretendard_ExtraBold.woff2`
      ).toString("base64"),
      bold: readFileSync(
        `${__dirname}/../_fonts/Pretendard_Bold.woff2`
      ).toString("base64"),
    };
  }
  return fonts;
}

// CSS 생성 함수
function getCss(theme: Theme, fontSize: string): string {
  const { regular, bold } = loadFonts();

  const styles = {
    light: {
      background: "white",
      foreground: "black",
      radial: "lightgray",
    },
    dark: {
      background: "black",
      foreground: "white",
      radial: "dimgray",
    },
  };

  const currentStyle = styles[theme] || styles.light;

  return `
    @font-face {
      font-family: 'Pretandard';
      font-style: normal;
      font-weight: normal;
      src: url(data:font/woff2;charset=utf-8;base64,${regular}) format('woff2');
    }

    @font-face {
      font-family: 'Pretandard_Bold';
      font-style: normal;
      font-weight: bold;
      src: url(data:font/woff2;charset=utf-8;base64,${bold}) format('woff2');
    }

    body {
      background: ${currentStyle.background};
      background-image: radial-gradient(circle at 25px 25px, ${
        currentStyle.radial
      } 2%, transparent 0%),
                        radial-gradient(circle at 75px 75px, ${
                          currentStyle.radial
                        } 2%, transparent 0%);
      background-size: 100px 100px;
      height: 100vh;
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: center;
    }

    code {
      color: #D400FF;
      font-family: 'Pretandard', sans-serif;
      white-space: pre-wrap;
      letter-spacing: -5px;
    }

    code::before, code::after {
      content: '\`';
    }

    .logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      margin: 0 75px;
    }

    .plus {
      color: #BBB;
      font-family: Times New Roman, Verdana;
      font-size: 100px;
    }

    .spacer {
      margin: 150px;
    }

    .emoji {
      height: 1em;
      width: 1em;
      margin: 0 0.05em 0 0.1em;
      vertical-align: -0.1em;
    }
      
    .heading {
      font-family: 'Pretandard_Bold', sans-serif;
      font-size: ${sanitizeHtml(fontSize)};
      font-style: normal;
      color: ${currentStyle.foreground};
      line-height: 1.8;
    }
  `;
}

// HTML 생성 함수
export function getHtml(parsedReq: ParsedRequest): string {
  const { text, theme, md, fontSize, images, widths, heights } = parsedReq;
  let sanitizedText = sanitizeHtml(text);
  console.log("Parsed Request Images:", images);

  if (md) {
    sanitizedText = applyMarkdown(sanitizedText);
  }

  const htmlContent = emojify(sanitizedText);
  const css = getCss(theme, fontSize);
  const imageSection =
    images.length > 0 ? generateImageSection(images, widths, heights) : "";

  return `
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="utf-8">
        <title>Generated Image</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          ${css}
        </style>
      </head>
      <body>
        <div>
          <div class="spacer">
            ${imageSection}
            <div class="spacer"></div>
            <div class="heading">${htmlContent}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Markdown 변환 함수
function applyMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, (_, match) => `<b>${match}</b>`)
    .replace(/__(.+?)__/g, (_, match) => `<b>${match}</b>`)
    .replace(/\*(.+?)\*/g, (_, match) => `<i>${match}</i>`)
    .replace(/_(.+?)_/g, (_, match) => `<i>${match}</i>`);
}

// 이미지 섹션 생성 함수
function generateImageSection(
  images: string[],
  widths: string[],
  heights: string[]
): string {
  return `
    <div class="logo-wrapper">
      ${images
        .map(
          (img, i) =>
            `${i !== 0 ? getPlusSign() : ""}${getImage(
              img,
              widths[i],
              heights[i]
            )}`
        )
        .join("")}
    </div>
  `;
}

// 이미지 태그 생성 함수
function getImage(
  src: string,
  width: string = "auto",
  height: string = "225"
): string {
  return `
    <img
      class="logo"
      alt="Generated Image"
      src="${sanitizeHtml(src)}"
      width="${sanitizeHtml(width)}"
      height="${sanitizeHtml(height)}"
    />
  `;
}

// 플러스 기호 생성 함수
function getPlusSign(): string {
  return '<div class="plus">+</div>';
}
