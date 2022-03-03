/*
 * @Author: Cphayim
 * @Date: 2021-07-17 13:40:26
 * @Description: generate vrn-manifest.json
 */

import path from 'path'
import fs from 'fs-extra'
import { logger } from '@ombro/logger'
import { Boilerplate, Lang, Manifest } from '@vrn-deco/boilerplate-protocol'
import { archivePackage, getAllBoilerplatePackage } from './utils'

if (require.main === module) {
  genManifest()
} else {
  throw new Error('The module can only be used as a startup module.')
}

function genManifest() {
  try {
    logger.startLoading('Find boilerplate packages...')
    const pkgs = getAllBoilerplatePackage()

    logger.startLoading('Disposal data and archive...')
    const manifest = archivePackage(pkgs)
    sortManifest(manifest)

    logger.startLoading('Write vrn-manifest.json...')
    writeManifest(manifest)

    logger.done('Generated vrn-manifest.json.')
  } finally {
    logger.stopLoading()
  }
}

function sortManifest(manifest: Manifest) {
  const UNKNOWN_PRIORITY = 100
  const LangPriority: Record<string, number> = {
    TypeScript: 0,
    JavaScript: 1,
    Python: 2,
    Dart: 3,
  }
  const cached = new Set<Lang>()
  manifest.sort((langA, langB) => {
    if (!cached.has(langA)) {
      sortBoilerplate(langA.boilerplate)
      cached.add(langA)
    }
    if (!cached.has(langB)) {
      sortBoilerplate(langB.boilerplate)
      cached.add(langB)
    }
    const langAPriority = LangPriority[langA.name] ?? UNKNOWN_PRIORITY
    const langBPriority = LangPriority[langB.name] ?? UNKNOWN_PRIORITY
    return langAPriority - langBPriority
  })
}

function sortBoilerplate(boilerplate: Boilerplate[]) {
  boilerplate.sort((a, b) => {
    return a.sort! - b.sort!
  })
}

function writeManifest(manifest: Manifest): void {
  fs.writeJSONSync(path.resolve(__dirname, '..', 'vrn-manifest.json'), manifest, { spaces: 2 })
}
