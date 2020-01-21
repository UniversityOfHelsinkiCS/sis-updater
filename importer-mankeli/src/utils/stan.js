const natsStreaming = require('node-nats-streaming')
const { HOSTNAME, NATS_URI, NATS_TOKEN } = process.env

const stan = natsStreaming.connect('sis-importer-nats', HOSTNAME, {
  url: NATS_URI,
  token: NATS_TOKEN
})

const opts = stan.subscriptionOptions()
opts.setManualAckMode(true)
opts.setAckWait(60 * 1000)
opts.setMaxInFlight(1)

const SCHEDULER_STATUS_CHANNEL = 'SCHEDULER_STATUS_CHANNEL'
const ORI_PERSON_CHANNEL = 'ORI_PERSON_CHANNEL'
const ORI_ATTAINMENT_CHANNEL = 'ORI_ATTAINMENT_CHANNEL'
const ORI_STUDY_RIGHT_CHANNEL = 'ORI_STUDY_RIGHT_CHANNEL'
const KORI_COURSE_UNIT_CHANNEL = 'KORI_COURSE_UNIT_CHANNEL'
const KORI_COURSE_UNIT_REALISATION_CHANNEL = 'KORI_COURSE_UNIT_REALISATION_CHANNEL'
const KORI_ASSESSMENT_ITEM_CHANNEL = 'KORI_ASSESSMENT_ITEM_CHANNEL'
const KORI_EDUCATION_CHANNEL = 'KORI_EDUCATION_CHANNEL'
const KORI_MODULE_CHANNEL = 'KORI_MODULE_CHANNEL'

module.exports = {
  stan,
  opts,
  SCHEDULER_STATUS_CHANNEL,
  ORI_PERSON_CHANNEL,
  ORI_ATTAINMENT_CHANNEL,
  ORI_STUDY_RIGHT_CHANNEL,
  KORI_COURSE_UNIT_CHANNEL,
  KORI_COURSE_UNIT_REALISATION_CHANNEL,
  KORI_ASSESSMENT_ITEM_CHANNEL,
  KORI_EDUCATION_CHANNEL,
  KORI_MODULE_CHANNEL
}
