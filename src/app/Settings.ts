import * as path from "path"
import { getUserDataPath, readFile, writeStringToFile } from "~/util/FileUtils"

import { defaultSettings } from "~/app/data/DefaultSettings"
import { ISettings } from "~/app/model"

const fileName = "settings.json"

export const loadSettings = async (): Promise<ISettings> => {
  const filePath = path.join(getUserDataPath(), fileName)
  let rawSettings
  try {
    rawSettings = await readFile(filePath)
    return JSON.parse(rawSettings)
  } catch (e) {
    saveSettings(defaultSettings)
    return defaultSettings
  }
}

export const saveSettings = async (settings: ISettings): Promise<void> => {
  const filePath = path.join(getUserDataPath(), fileName)
  writeStringToFile(filePath, JSON.stringify(settings))
}
