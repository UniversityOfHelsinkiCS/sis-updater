const { schedule } = require('./utils/cron')
const { sadd, smembers } = require('./utils/redis')
const educationSearchQuery = require('./queries/educationSearch')

const testQuery = async () => {
  const response = await educationSearchQuery({ fullTextQuery: 'Tietojenkäsittelytietee' })
  console.log('response', response)
}

const init = async () => {
  await sadd('time', `Initialized at ${new Date()}`)
  const times = await smembers('time')
  console.log(times)
  await testQuery()
}

schedule('*/10 * * * * *', async () => {
  console.log('CRON!', process.env.NODE_ENV)
})

init()
