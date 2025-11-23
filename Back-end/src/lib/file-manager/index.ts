import { promises as fsp, constants as FS_CONST, existsSync, mkdirSync } from 'fs';
import path from 'path';
import JSZip from 'jszip';

type BaseDir = 'uploads' | 'public';

type ZipMemFile = {
  name: string;
  data: Buffer | string; // langsung isi konten
  fromDisk?: false | undefined;
};

type ZipDiskFile = {
  name: string;
  data: string; // path ke file di disk
  fromDisk: true;
};

type ZipFileInput = ZipMemFile | ZipDiskFile;

class FileManager {
  constructor() {}

  makeDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  generateFilename(originalname: string): string {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${uniqueSuffix}-${originalname}`;
  }


  /**
   * Hapus satu file jika ada.
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      await fsp.access(filepath, FS_CONST.F_OK);
      await fsp.unlink(filepath);
    } catch {
      // diamkan jika tidak ada
    }
  }

  /**
   * Hapus banyak file bila ada.
   */
  async deleteFiles(filepaths: string[]): Promise<void> {
    await Promise.all(filepaths.map((fp) => this.deleteFile(fp)));
  }

  /**
   * Salin file ke bucket tujuan jika sumber ada.
   */
  async copyFile(filepath: string, dir: BaseDir, bucket: string): Promise<string | null> {
    try {
      await fsp.access(filepath, FS_CONST.F_OK);
    } catch {
      return null;
    }
    this.makeDir(`${dir}/${bucket}`);
    const filename = path.basename(filepath);
    const destFilepath = path.join(dir, bucket, filename);
    await fsp.copyFile(filepath, destFilepath);
    return destFilepath;
  }

  /**
   * Cek eksistensi path.
   */
  async exist(filepath: string): Promise<boolean> {
    try {
      await fsp.access(filepath, FS_CONST.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Membuat/menambah zip dari buffer yang sudah ada atau baru.
   * - Jika `fromDisk: true`, maka `data` dianggap path file di disk.
   * - Jika tidak, `data` dianggap konten langsung (Buffer/string).
   */
  async zipFiles(existingZipBuffer: Buffer | null, files: ZipFileInput[]): Promise<Buffer> {
    const zip = existingZipBuffer ? await JSZip.loadAsync(existingZipBuffer) : new JSZip();

    for (const file of files) {
      let fileData: Buffer | string = file.data;
      if (file.fromDisk) {
        // `file.data` adalah path string
        fileData = await fsp.readFile(file.data);
      }
      zip.file(file.name, fileData);
    }

    return await zip.generateAsync({ type: 'nodebuffer' });
  }
}

export default FileManager;
