const serve = require("serve")
const path = require("path")
const server = serve(path.join(__dirname, "dist"), {
    port: 8089,
    ignore: ["node_modules"],
})
