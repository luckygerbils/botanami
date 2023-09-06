/*
 * Extremely basic TAR file building based on
 * - https://www.gnu.org/software/tar/manual/html_node/Standard.html
 * - https://github.com/porsager/tarts
 * 
 * I didn't want to add a huge dependency (that I'd have to be worried about the security of)
 * for this feature at this time.
 */

interface FileEntry {
  name: string,
  content: string|Uint8Array|Blob,
}

// A tar archive file contains a series of blocks. Each block contains BLOCK_SIZE bytes. 
const BLOCK_SIZE = 512;

export async function tar(files: FileEntry[]): Promise<Blob> {
  // Convert all files to Uint8Array, get size for each entry
  const entries = await Promise.all(files.map(async (file) => {
    const content = 
      file.content instanceof Uint8Array ? file.content : 
      typeof file.content === "string"   ? new TextEncoder().encode(file.content) :
      new Uint8Array(await file.content.arrayBuffer());

    // Metadata takes up one BLOCK_SIZE, rest of content fits into length/BLOCK_SIZE blocks
    const entryLengthBytes = (Math.ceil(content.byteLength / BLOCK_SIZE) + 1) * BLOCK_SIZE;
    return { name: file.name, content, entryLengthBytes };
  }));

  const bytes = new Uint8Array(
    entries.reduce((sum, { entryLengthBytes }) => sum + entryLengthBytes, 0));

  let fileOffset = 0;
  for (const { name: fileName, content, entryLengthBytes } of entries) {
    const entryBytes = bytes.subarray(fileOffset, fileOffset + entryLengthBytes);
    fileOffset += entryLengthBytes;

    // The mtime field represents the data modification time of the file at the time it was archived. 
    // It represents the integer number of seconds since January 1, 1970, 00:00 Coordinated Universal Time. 
    const mtime = Math.floor(Number(new Date()) / 1000);

    if (fileName.length >= 200) {
      throw new Error(`file name length must be < 200 bytes. Was: ${fileName.length}`);
    } 
    const name = fileName.length < 100 ? fileName : fileName.slice(100, 200);
    const prefix = fileName.length < 100 ? "" : fileName.slice(0, 100);

    // The name, linkname, magic, uname, and gname are null-terminated character strings. 
    /// All other fields are zero-filled octal numbers in ASCII. 
    // char name[100];               /*   0 */
    entryBytes.set(toBytes(name), 0);
    // char mode[8];                 /* 100 */
    entryBytes.set(toBytes("777".padStart(7, "0")), 100);
    // char uid[8];                  /* 108 */
    entryBytes.set(toBytes("0000000\0"), 108);
    // char gid[8];                  /* 116 */
    entryBytes.set(toBytes("0000000\0"), 116);
    // char size[12];                /* 124 */
    entryBytes.set(toBytes(content.byteLength.toString(8).padStart(11, "0")), 124);
    // char mtime[12];               /* 136 */
    entryBytes.set(toBytes(mtime.toString(8).padStart(11, "0")), 136);
    // char chksum[8];               /* 148 */
    entryBytes.set(toBytes("        "), 148);
    // char typeflag;                /* 156 */
    entryBytes.set(toBytes("0"), 156);
    // char linkname[100];           /* 157 */
    entryBytes.set(toBytes(""), 157);
    // char magic[6];                /* 257 */
    entryBytes.set(toBytes("ustar"), 257);
    // char version[2];              /* 263 */
    entryBytes.set(toBytes("  "), 263);
    // char uname[32];               /* 265 */
    entryBytes.set(toBytes(""), 265);
    // char gname[32];               /* 297 */
    entryBytes.set(toBytes(""), 297);
    // char devmajor[8];             /* 329 */
    entryBytes.set(toBytes(""), 329);
    // char devminor[8];             /* 337 */
    entryBytes.set(toBytes(""), 337);
    // char prefix[155];             /* 345 */
    entryBytes.set(toBytes(prefix), 345);
    // char padding[12]              /* 500 */

    // The chksum field represents the simple sum of all bytes in the header block. 
    // Each 8-bit byte in the header is added to an unsigned integer, initialized to zero, 
    // the precision of which shall be no less than seventeen bits. 
    // When calculating the checksum, the chksum field is treated as if it were filled with spaces (ASCII 32). 
    const checksum = entryBytes.subarray(0, BLOCK_SIZE).reduce((a, b) => a + b, 0);
    entryBytes.set(toBytes(checksum.toString(8).padStart(7, "0")), 148);

    // char content[...]             /* 512 */
    entryBytes.set(content, BLOCK_SIZE);
  }

  return new Blob([bytes], { type: 'application/tar' });
}

function toBytes(s: string) {
  return s.split("").map(c => c.charCodeAt(0));
}

export async function untar(tarFile: Blob): Promise<FileEntry[]> {
  if (tarFile.type !== "application/tar") {
    throw new Error(`Not a tar file: ${tarFile.type}`);
  }

  const bytes = new Uint8Array(await tarFile.arrayBuffer());

  const entries: FileEntry[] = [];

  let entryOffset = 0;
  while (entryOffset < bytes.byteLength) {
    // console.log("processing entry at", entryOffset);

    // Header is one block
    const headerBytes = bytes.subarray(entryOffset, entryOffset + BLOCK_SIZE);
    // char name[100];               /*   0 */
    const nameBytes = headerBytes.subarray(0, 100);
    const name = String.fromCharCode(...nameBytes.subarray(0, nameBytes.indexOf(0)));

    // console.log("name is", nameBytes, name);

    // char size[12];                /* 124 */
    const sizeBytes = headerBytes.subarray(124, 124 + 12);
    const size = parseInt(String.fromCharCode(...sizeBytes), 8);

    // console.log("size is", sizeBytes, size);

    // char prefix[155];             /* 345 */
    const prefixBytes = headerBytes.subarray(345, 345 + 100);
    const prefix = String.fromCharCode(...prefixBytes.subarray(0, prefixBytes.indexOf(0)));

    // console.log("prefix is", prefixBytes, prefix);

    const contentStartOffset = entryOffset + BLOCK_SIZE;
    const contentEndOffset = entryOffset + BLOCK_SIZE + size;
    const content = bytes.subarray(contentStartOffset, contentEndOffset);

    entries.push({
      name: prefix + name,
      content,
    });

    const totalEntryLengthBytes = (Math.ceil(size / BLOCK_SIZE) + 1) * BLOCK_SIZE;
    entryOffset += totalEntryLengthBytes;
  }

  return entries;
}