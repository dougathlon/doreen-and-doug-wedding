import { getFontEmbedCSS, toJpeg } from "html-to-image";
import { PDFDocument, PageSizes } from "pdf-lib";

export async function createInvitationPdf(sheets, onProgress) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Doreen & Doug — postal invitations");
  pdf.setLanguage("en-GB");
  const fontEmbedCSS = await getFontEmbedCSS(sheets[0]);
  for (let index = 0; index < sheets.length; index += 1) {
    onProgress(`Preparing invitation ${index + 1} of ${sheets.length}…`);
    const data = await toJpeg(sheets[index], {
      pixelRatio: 300 / 96,
      quality: 0.98,
      width: 210 * 96 / 25.4,
      height: 297 * 96 / 25.4,
      style: { transform: "none", boxShadow: "none" },
      fontEmbedCSS,
    });
    const image = await pdf.embedJpg(data);
    const page = pdf.addPage(PageSizes.A4);
    page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  }
  return pdf.save();
}
