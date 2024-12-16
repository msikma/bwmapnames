// @dada78641/screp-ts <https://github.com/msikma/screp-ts>
// © MIT license

import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {promises as fs} from 'node:fs'
import {spawn} from 'node:child_process'
import * as process from 'node:process'

interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number | null
  abortSignal: AbortSignal | null
}

/**
 * Spawns a child process, captures its output, and returns the result.
 * 
 * This is equivalent to using a command on the command line and capturing its result.
 * If something goes wrong spawning the process, such as the command not being found,
 * or the correct rights to run the command not being present, an error is thrown.
 */
function runCommand(command: string[]): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    if (command.length === 0) {
      return reject(new Error('No command was provided'))
    }

    const [cmd, ...args] = command
    const child = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']})

    const stdout: Buffer[] = []
    const stderr: Buffer[] = []

    child.stdout.on('data', data => stdout.push(data))
    child.stderr.on('data', data => stderr.push(data))

    child.on('close', (exitCode, abortSignal) => {
      if (abortSignal) {
        return reject(new Error(`Child process was terminated abnormally: ${String(abortSignal)}`))
      }
      resolve({
        stdout: Buffer.concat(stdout).toString(),
        stderr: Buffer.concat(stderr).toString(),
        exitCode,
        abortSignal
      })
    })

    child.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Utility script for updating the map names.
 * 
 * Uses @dada78641/bwstats to fetch new map names.
 */
async function main() {
  const action: string = process.argv[2]
  const dataPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data.json')
  if (action === 'get') {
    // Get new map names and write a new JSON file.
    // New map names will be in Korean only and need to be manually translated into English.
    const res = await runCommand(['bwstats.js', '--map-names'])
    await fs.writeFile(dataPath, res.stdout, 'utf8')
  }
  if (action === 'sort') {
    // Sort map names in the JSON file.
    // Do this after translating the new map names. Then commit, bump the version number and publish.
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'))
    data.maps = data.maps.sort((a: any, b: any) => a.eng < b.eng ? -1 : 1)
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8')
  }
}

main()
