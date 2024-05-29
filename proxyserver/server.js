const express = require('express')
const proxyserver = express();
const PORT = 3001;
const fetch = require('node-fetch')
const cors = require('cors')

proxyserver.use(cors())

const url = "https://www.ncei.noaa.gov/cdo-web/api/v2/datasets";
const apiToken = "amWqIjomJLNuWtAUgYjqfAfKlTWgiQzC";


proxyserver.get("/", async (req, res) => {
    const response = await fetch(url,  {
        headers: {
            token: apiToken,
        }
    })
    const data = await response.json()
    res.json(await data)
})

proxyserver.listen(PORT, () => {
    console.log("Server listening on port: ", PORT)
})
