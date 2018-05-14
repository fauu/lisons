import { remote } from "electron"
import * as fs from "fs"
import * as isBinaryFile from "isbinaryfile"
import * as nodePath from "path"

export const getRootPath = (): string => {
  const dirname = nodePath.dirname(require!.main!.filename)
  return dirname.substring(0, dirname.lastIndexOf("/"))
}

export const getUserDataPath = (): string => {
  return remote.app.getPath("userData")
}

export const readFile = (path: string): Promise<Buffer> =>
  new Promise<any>((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })

export const writeStringToFile = (path: string, s: string): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    fs.writeFile(path, s, err => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })

export const fileSize = (path: string): Promise<number> =>
  new Promise<number>((resolve, reject) => {
    fs.lstat(path, (err, stat) => {
      if (err) {
        reject(err)
      }
      resolve(stat.size)
    })
  })

export const isBufferText = (data: Buffer, size: number): Promise<boolean> =>
  new Promise<boolean>((resolve, _) => {
    isBinaryFile(data, size, (err: Error, result: boolean) => {
      resolve(!err && !result)
    })
  })

// https://stackoverflow.com/a/40177447
const allRWEPermissions = parseInt("0777", 8)
export const ensurePathExists = (path: string, mask: number = allRWEPermissions): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    fs.mkdir(path, mask, err => {
      if (err) {
        if (err.code === "EEXIST") {
          resolve()
        } else {
          reject(err)
        }
      } else {
        resolve()
      }
    })
  })
