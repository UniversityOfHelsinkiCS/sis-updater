const { set: redisSet, publish: redisPublish } = require('./utils/redis')
const { randomBytes } = require('crypto')
const { serviceIds } = require('./services')
const { schedule, resetOnetimeServices } = require('./scheduler')
const { SONIC, REJECT_UNAUTHORIZED, IS_DEV, CURRENT_EXECUTION_HASH, UPDATE_RETRY_LIMIT } = require('./config')
const { stan } = require('./utils/stan')
const { schedule: scheduleCron } = require('./utils/cron')
const { sleep } = require('./utils')
const { logger } = require('./utils/logger')
const requestBuffer = require('./utils/requestBuffer')

let forbiddenServiceIds = []
let isImporting = false

if (process.env['NODE_ENV'] === 'development') {
  require('./explorer')
}

if (!REJECT_UNAUTHORIZED) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const updateOrdinalFrom = async (total, redisKey, ordinal) => {
  if (total) await redisSet(redisKey, ordinal)
}

const updateHash = async () => {
  const generatedHash = randomBytes(12).toString('hex')
  await redisSet(CURRENT_EXECUTION_HASH, generatedHash)
  await redisPublish(CURRENT_EXECUTION_HASH, generatedHash)
  return generatedHash
}

const updateNext = current => {
  requestBuffer.flush()
  update(current + 1)
}

const update = async (current, attempt = 1) => {
  const start = new Date()
  if (IS_DEV && !SONIC) {
    await sleep(1000)
  }

  const generatedHash = await updateHash()
  const serviceId = serviceIds[current]
  if (!serviceId) {
    console.log('Importing finished')
    isImporting = false
    return
  }

  console.log(`Importing ${serviceId} (${current + 1}/${Object.keys(serviceIds).length})`)
  try {
    if (forbiddenServiceIds.includes(serviceId)) {
      console.log(`Skipping forbidden serviceId ${serviceId}`)
      return updateNext(current)
    }
    const data = await schedule(serviceId, generatedHash)
    if (!data) return updateNext(current)

    const { greatestOrdinal, hasMore, total, ordinalKey } = data
    console.log(`New ordinal for ${serviceId}: ${greatestOrdinal}`)
    await updateOrdinalFrom(total, ordinalKey, greatestOrdinal)
    hasMore ? update(current) : updateNext(current)

    logger.info({ message: 'Imported batch', timems: new Date() - start })
  } catch (err) {
    requestBuffer.flush()
    const forbiddenResource = ((err || {}).response || {}).status === 403
    const canStillRetry = attempt <= UPDATE_RETRY_LIMIT
    if (forbiddenResource) {
      console.log('Added resource to list of forbidden resources')
      logger.error({ message: `Forbidden service: ${serviceId}`, serviceId })
      forbiddenServiceIds.push(serviceId)
      return updateNext(current)
    }
    if (canStillRetry) {
      return update(current, ++attempt)
    }

    logger.error({ message: 'Importing failed', meta: err.stack })
    return updateNext(current)
  }
}

const run = async () => {
  if (isImporting) return

  isImporting = true
  requestBuffer.flush()
  update(0)
}

stan.on('connect', async ({ clientID }) => {
  console.log(`Connected to NATS as ${clientID}...`)
  await resetOnetimeServices()
  run()
  scheduleCron(IS_DEV || SONIC ? '* * * * * *' : '0 * * * *', run)
})

stan.on('error', e => {
  console.log('STAN ERROR', e)
  process.exit(1)
})
