import type {
  ExtensionContext,
  Position,
  TextDocument,
} from 'vscode'
import {
  Hover,
  languages,
} from 'vscode'
import { name } from './generated/meta'
import { getLibName, getLibs, logger } from './utils'

export function activate(context: ExtensionContext) {
  try {
    logger.info(`${name} is initialized !`)
    const hoverDisposable = languages.registerHoverProvider(
      { pattern: '**/*.{ts,js,tsx,jsx,vue}' },
      { provideHover },
    )
    context.subscriptions.push(hoverDisposable)
  }
  catch (error) {
    logger.error(error)
  }
}

async function provideHover(document: TextDocument, position: Position) {
  try {
    const regExp = /.*from\s+["'](.*)["']/
    const line = document.lineAt(position.line)
    const match = line.text.match(regExp)
    const libs = getLibs()
    let libName = match && match[1]
    if (!libName || !libs) {
      return
    }
    libName = getLibName(libName, libs)
    if (libName) {
      logger.info(`Detect Lib: ${libName}`)
      const npmHome = `NPM: https://www.npmjs.com/package/${libName}`
      return new Hover(npmHome)
    }
  }
  catch (error) {
    logger.error(error)
  }
}
