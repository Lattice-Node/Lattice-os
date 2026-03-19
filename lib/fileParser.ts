export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv" || ext === "txt") {
    return await file.text();
  }

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    let result = "";
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      result += `[シート: ${sheetName}]\n`;
      result += XLSX.utils.sheet_to_csv(sheet) + "\n\n";
    }
    return result;
  }

  if (ext === "pdf") {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
    const data = await res.json();
    return data.text || "";
  }

  return await file.text();
}
