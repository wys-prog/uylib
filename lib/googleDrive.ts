// googleDrive.ts

const FOLDER_NAME = "UyghurLibrary";

let folderId: string | null = null;

export async function ensureAppFolder(): Promise<string> {
  if (folderId) return folderId;

  const res = await window.gapi.client.drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
    fields: "files(id, name)",
  });

  if (res.result.files.length > 0) {
    folderId = res.result.files[0].id;
  } else {
    const folder = await window.gapi.client.drive.files.create({
      resource: {
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    folderId = folder.result.id;
  }

  return folderId!;
}

export async function uploadFile(name: string, content: string, mimeType: string) {
  const folderId = await ensureAppFolder();

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = {
    name,
    mimeType,
    parents: [folderId],
  };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelim;

  await window.gapi.client.request({
    path: "/upload/drive/v3/files",
    method: "POST",
    params: { uploadType: "multipart" },
    headers: {
      "Content-Type": `multipart/related; boundary="${boundary}"`,
    },
    body: multipartRequestBody,
  });
}

export async function listBooks() {
  const folderId = await ensureAppFolder();
  const res = await window.gapi.client.drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType)",
  });

  return res.result.files;
}

export async function downloadFile(fileId: string): Promise<string> {
  const res = await window.gapi.client.drive.files.get({
    fileId,
    alt: "media",
  });
  return res.body;
}
