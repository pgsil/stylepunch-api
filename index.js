const express = require('express')
const app = express()


app.get('/styles/:styles', (req, res) => {
    if (req.params.styles.length > 0) {
        res.send(req.params.styles)
    }
    else {
        res.sendStatus(500)
    }
})

app.get('/*', (req, res) => res.sendStatus(404))

app.listen(3000, () => console.log('Example app listening on port 3000!'))