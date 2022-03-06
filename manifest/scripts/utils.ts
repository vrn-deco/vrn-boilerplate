import path from 'path'
import fs from 'fs-extra'
import execa from 'execa'
import {
  Boilerplate,
  Lang,
  Manifest,
  verifyVRNBoilerplateConfig,
  VRNBoilerplateConfig,
} from '@vrn-deco/boilerplate-protocol'

interface ScanPackage {
  name: string
  version: string
  private: boolean
  path: string
}

export function getRepoDir(): string {
  const repoDir = path.resolve(__dirname, '..', '..')
  const repoPkgPath = path.join(repoDir, 'package.json')
  const isValid =
    fs.existsSync(repoPkgPath) && fs.readJSONSync(repoPkgPath).name === 'vrn-boilerplate-monorepo'
  if (!isValid) throw new Error('Generator must run in the monorepo')
  return repoDir
}

export function getAllBoilerplatePackage(): ScanPackage[] {
  const { stdout } = execa.commandSync('pnpm list -r --json --depth -1', { cwd: getRepoDir() })
  return JSON.parse(stdout).filter((pkg: ScanPackage) => /\/packages\/.+\/.+/.test(pkg.path))
}

export function archivePackage(pkgs: ScanPackage[]): Manifest {
  const langMap: Record<Lang['name'], Boilerplate[]> = {}

  pkgs.forEach(({ path: location }) => {
    if (!fs.pathExistsSync(location)) throw new Error(`${location} not exists`)

    const pkgPath = path.join(location, 'package.json')
    const configPath = path.join(location, 'vrn-boilerplate.json')

    if (!fs.existsSync(pkgPath)) throw new Error(`${pkgPath} not exists`)
    if (!fs.existsSync(configPath)) throw new Error(`${configPath} not exists`)

    const pkg = fs.readJsonSync(pkgPath) as { name: string; version: string }
    const config = fs.readJSONSync(configPath) as VRNBoilerplateConfig

    verifyVRNBoilerplateConfig(config, configPath)

    const boilerplate: Boilerplate = {
      name: config.name,
      desc: config.desc ?? '',
      package: pkg.name,
      version: pkg.version,
      tags: config.tags ?? [],
      sort: config.sort ?? 100,
    }
    if (langMap[config.language]) {
      langMap[config.language]!.push(boilerplate)
    } else {
      langMap[config.language] = [boilerplate]
    }
  })

  const manifest: Manifest = Object.entries(langMap).map(([name, boilerplate]) => {
    boilerplate.sort((a, b) => (a.name > b.name ? 1 : -1))
    return {
      name,
      boilerplate,
    }
  })

  return manifest
}