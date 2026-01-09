/**
 * PDF 파일에서 텍스트 추출
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // 동적 import로 pdfjs-dist 로드 (브라우저 환경 대응)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib: any = await import("pdfjs-dist");
    
    // PDF.js 워커 설정 (브라우저 환경)
    if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.0.379"}/pdf.worker.min.js`;
      }
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    let fullText = "";
    
    // 모든 페이지에서 텍스트 추출
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("PDF 텍스트 추출 오류:", error);
    // 에러 발생 시 빈 문자열 반환 (앱이 멈추지 않도록)
    return "";
  }
}

/**
 * PPT/PPTX 파일에서 텍스트 추출
 * PPTX는 ZIP 형식이므로 JSZip을 사용하여 추출
 */
export async function extractTextFromPPT(file: File): Promise<string> {
  try {
    // PPT/PPTX 파일은 복잡한 구조를 가지고 있어 간단한 추출만 수행
    // 실제 프로덕션에서는 서버 측 처리 또는 전용 라이브러리 필요
    console.warn("PPT/PPTX 파일의 텍스트 추출은 현재 지원되지 않습니다.");
    return `[${file.name}] - PPT/PPTX 파일은 현재 텍스트 추출이 지원되지 않습니다.`;
  } catch (error) {
    console.error("PPT 텍스트 추출 오류:", error);
    return "";
  }
}

/**
 * 파일 타입에 따라 텍스트 추출
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  switch (fileExtension) {
    case "pdf":
      return await extractTextFromPDF(file);
    case "ppt":
    case "pptx":
      return await extractTextFromPPT(file);
    default:
      console.warn(`지원하지 않는 파일 형식: ${fileExtension}`);
      return "";
  }
}

/**
 * 여러 파일에서 텍스트 추출
 */
export async function extractTextFromFiles(files: File[]): Promise<string> {
  const extractedTexts: string[] = [];

  for (const file of files) {
    const text = await extractTextFromFile(file);
    if (text.trim()) {
      extractedTexts.push(`[${file.name}]\n${text}`);
    }
  }

  return extractedTexts.join("\n\n---\n\n");
}

