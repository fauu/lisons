import { remote } from "electron";
import * as fs from "fs";
import * as isBinaryFile from "isbinaryfile";
import * as nodePath from "path";

export const getRootPath = (): string => {
  const dirname = nodePath.dirname(require!.main!.filename);
  return dirname.substring(0, dirname.lastIndexOf("/"));
};

export const getUserDataPath = (): string => {
  return remote.app.getPath("userData");
};

export const exists = (path: string): Promise<boolean> =>
  new Promise<boolean>((resolve, _) => {
    fs.exists(path, result => resolve(result));
  });

export const readFile = (path: string): Promise<Buffer> =>
  new Promise<any>((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });

export const writeFile = <T>(path: string, data: T): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

// https://stackoverflow.com/a/41052903
export const deleteFile = (path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!path.toLowerCase().includes("lisons")) {
      return reject();
    }
    fs.lstat(path, (lstatErr, stats) => {
      if (lstatErr) {
        return reject(lstatErr);
      }
      if (stats.isDirectory()) {
        resolve(deleteDirectory(path));
      } else {
        fs.unlink(path, unlinkErr => {
          if (unlinkErr) {
            return reject(unlinkErr);
          }
          resolve();
        });
      }
    });
  });

const deleteDirectory = (dir: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.access(dir, accessErr => {
      if (accessErr) {
        return reject(accessErr);
      }
      fs.readdir(dir, (readdirErr, files) => {
        if (readdirErr) {
          return reject(readdirErr);
        }
        Promise.all(
          files.map(file => {
            return deleteFile(nodePath.join(dir, file));
          })
        )
          .then(() => {
            fs.rmdir(dir, rmdirErr => {
              if (rmdirErr) {
                return reject(rmdirErr);
              }
              resolve();
            });
          })
          .catch(reject);
      });
    });
  });

export const fileSize = (path: string): Promise<number> =>
  new Promise<number>((resolve, reject) => {
    fs.lstat(path, (err, stat) => {
      if (err) {
        return reject(err);
      }
      resolve(stat.size);
    });
  });

export const isBufferText = (data: Buffer, size: number): Promise<boolean> =>
  new Promise<boolean>((resolve, _) => {
    isBinaryFile(data, size, (err: Error, result: boolean) => {
      resolve(!err && !result);
    });
  });

// https://stackoverflow.com/a/40177447
// TODO: Support multi-level paths
const allRWEPermissions = parseInt("0777", 8);
export const ensurePathExists = (path: string, mask: number = allRWEPermissions): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    fs.mkdir(path, mask, err => {
      if (err) {
        if (err.code === "EEXIST") {
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
