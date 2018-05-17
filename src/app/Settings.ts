import * as path from "path"

import { getUserDataPath, readFile, writeStringToFile } from "~/util/FileUtils"

import { defaultSettings } from "~/app/data/DefaultSettings"
import { Settings } from "~/app/model"

const fileName = "settings.json"

export const loadSettings = async (): Promise<Settings> => {
  const filePath = path.join(getUserDataPath(), fileName)
  let rawSettings
  try {
    rawSettings = (await readFile(filePath)).toString()
    return JSON.parse(rawSettings)
  } catch (e) {
    saveSettings(defaultSettings)
    return defaultSettings
  }
}

export const saveSettings = async (settings: Settings): Promise<void> => {
  const filePath = path.join(getUserDataPath(), fileName)
  writeStringToFile(filePath, JSON.stringify(settings))
}
