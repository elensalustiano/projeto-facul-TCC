const app = require('./app')
const port = process.env.PORT || 3000

// Turn on that server!
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
  console.log('Para derrubar o servidor: ctrl + c')
})
