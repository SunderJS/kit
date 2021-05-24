import { writeFile, readFileSync, existsSync } from "fs-extra";

/**
 * A very basic mock implementation of KV that is entirely in-memory.
 */
export class MemoryMockKV {
  private m = new Map();

  get(key: string, type: "json" | "text" = "text") {
    if (!this.m.has(key)) return Promise.resolve(null);

    let val = this.m.get(key);
    if (val !== undefined && type === "json") {
      val = JSON.parse(val);
    }
    return Promise.resolve(val);
  }
  put(key: string, value: string) {
    this.m.set(key, value);
    return Promise.resolve(undefined);
  }
  delete(key: string) {
    this.m.delete(key);
    return Promise.resolve(undefined);
  }
  list(prefix: string, _limit: number, _cursor: string) {
    throw Error("KV list not implemented in mock");
  }
}

/**
 * A basic Node KV implementation that persists to disk at the given path, useful for local development.
 * Don't use this for production, ever.
 */
export class FileSystemMockKV {
  private m: { [key: string]: string } = {};
  private filepath: string;

  /**
   *
   * @param filepath filepath to persist to, should end in `.json`.
   */
  constructor(filepath: string) {
    this.filepath = filepath;

    if (existsSync(filepath)) {
      const f = readFileSync(filepath, { encoding: "utf-8" });
      this.m = JSON.parse(f);
    } else {
      this.m = {};
    }
  }

  private async persist() {
    const s = JSON.stringify(await this.m);
    await writeFile(this.filepath, s, { encoding: "utf-8" });
  }

  async get(key: string, type: "json" | "text" = "text") {
    const m = await this.m;
    if (m[key] === undefined) return Promise.resolve(null);

    let val = m[key];
    if (val !== undefined && type === "json") {
      val = JSON.parse(val);
    }
    return Promise.resolve(val);
  }

  async put(key: string, value: string) {
    const m = await this.m;
    m[key] = value;

    await this.persist();
    return Promise.resolve(undefined);
  }
  async delete(key: string) {
    const m = await this.m;
    delete m[key];

    await this.persist();
    return Promise.resolve(undefined);
  }
  list(prefix: string, _limit: number, _cursor: string) {
    throw Error("KV list not implemented in mock");
  }
}
