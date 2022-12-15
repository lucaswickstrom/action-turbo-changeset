import { debug, setFailed, setOutput } from '@actions/core'
import { execSync } from 'node:child_process'
import { z } from 'zod'

async function run(): Promise<void> {
  try {
    const json = await execSync(
      `npx turbo run build --dry-run=json`,
      {
        cwd: process.cwd(),
        encoding: 'utf-8',
      },
    )

    debug(`Output from Turborepo: ${json}`)

    const parsedJson = z.object({
      tasks: z.array(z.object({
        package: z.string(),
        cacheState: z.object({
          local: z.boolean(),
          remote: z.boolean(),
        }),
      }))
    }).parse(json)

    const output = parsedJson.tasks.filter(({ cacheState }) => !(cacheState.local || cacheState.remote)).map((task) => task.package)

    setOutput('changeset', output)

    // const ms: string = core.getInput('milliseconds')
    // core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
