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

export const readFile = (path: string): Promise<any> =>
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

export const isText = (data: Buffer, size: number): Promise<boolean> =>
  new Promise<boolean>((resolve, _) => {
    isBinaryFile(data, size, (err: Error, result: boolean) => {
      resolve(!err && !result)
    })
  })
