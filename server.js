import 'dotenv/config'
import express from 'express'
const mySecret = process.env['OA_API_KEY']
import cors from 'cors'

import ask from './utils/openai.js'

const main = async ({ port }) => {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cors())

  app.get('/', (_req, res) => res.send('Welcome to GPT ask!'))

  app.post('/ussd', async (req, res) => {
    const { text } = req.body

    let response = ''

    if (text === '') {
      response = 'CON Welcome to GPT ASK.\nPlease note that this is not the actual.\nWe give you the tools to know the approximate bill in a given range.\nEnter: \n1. To start a prompt\n0. To exit'
    } else if (text === '1') {
      response = 'CON Please enter the diease of your patient. E.g. Malaria'
    } else if (text === '0') {
      response = 'END You have exited the GPT ASK. Thank you for using our service. Goodbye!'
    } else if (text.split(' ').length > 1) {
      console.log({ text })
      const disease = text.split(' ')
      const input = disease[disease.length - 1].split('#')[0]

      const outcome = await ask(input)

      if (outcome.status === 'success') {
        response = `END ${outcome.message}`
      } else {
        response = 'END Sorry, an error occurred. Please try again.'
      }
    } else {
      response = 'END Invalid input. Please try again.'
    };

    res.set('Content-Type: text/plain')
    res.send(response)
  })

  app.use('*', (_req, res) => res.status(400).send('Invalid route. Please check your URL and try again.'))

  app.listen(port, () => console.log(`App running on port ${port}`))
}

main({
  port: process.env.APP_PORT || 8152
})
