const fetch = require('node-fetch')

const handler = async function (event, context) {
  try {
    const response = await fetch('http://api.kivaws.org/v1/lending_actions/recent.json')
    if (!response.ok) {
      return { statusCode: response.status, body: response.statusText }
    }
    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify(data.lending_actions),
    }

  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    }
  }
}

module.exports = { handler }
