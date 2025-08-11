import type { WorkspaceFolder } from 'vscode'
import type { PackageJson } from './types'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { useLogger } from 'reactive-vscode'
import { workspace } from 'vscode'
import { displayName } from './generated/meta'

export const logger = useLogger(displayName)

const dependenciesSections = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
] as const

export function getLibs() {
  const workspaceFolders = workspace.workspaceFolders
  if (!workspaceFolders) {
    logger.error('No workspace folders found')
    return
  }
  const libs = workspaceFolders.reduce((libs, folder) => {
    const packageJson = getPackageJson(folder)
    if (!packageJson) {
      return libs
    }
    const packageJsonLibs = getPackageJsonLibs(packageJson)
    return libs.concat(packageJsonLibs)
  }, [] as string[])
  return libs
}

function getPackageJson(workspaceFolder: WorkspaceFolder): PackageJson | null {
  const packageJsonPath = join(workspaceFolder?.uri.fsPath, 'package.json')
  const packageJson = readFileSync(packageJsonPath, 'utf-8')
  if (!packageJson) {
    return null
  }
  return JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
}

function getPackageJsonLibs(packageJson: PackageJson): string[] {
  const libs = dependenciesSections.reduce((libs, section) => {
    if (!packageJson[section]) {
      return libs
    }
    return libs.concat(Object.keys(packageJson[section]))
  }, [] as string[])
  return libs
}

export function getLibName(libName: string) {
  if (!isValidLibName(libName)) {
    return ''
  }
  if (libName.startsWith('@types/')) {
    libName = libName.replace('@types/', '')
  }
  const chips = libName.split('/')
  let fixedLibName = ''
  if (libName.startsWith('@')) {
    fixedLibName = `${chips[0]}/${chips[1]}`
  }
  else {
    fixedLibName = chips[0]
  }
  return fixedLibName
}

function isValidLibName(libName: string) {
  let isValid = false
  if (/^@?[a-z0-9-_]/.test(libName)) {
    isValid = true
  }
  return isValid
}
