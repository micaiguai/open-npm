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
import { getLibName, logger } from './utils'

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
    logger.info(`line: ${line.text}`)
    const match = line.text.match(regExp)
    let libName = match && match[1]
    if (!libName) {
      return
    }
    libName = getLibName(libName)
    if (libName) {
      logger.info(`detect lib: ${libName}`)
      const npmHome = `NPM: https://www.npmjs.com/package/${libName}`
      return new Hover(npmHome)
    }
  }
  catch (error) {
    logger.error(error)
  }
}
