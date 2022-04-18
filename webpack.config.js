const path = require("path")
var webpack = require('webpack');
module.exports = {
  entry: path.resolve(__dirname, "exiusServerWebSrc.mjs"),
  output: {
    filename: "index.js",
    library: "Exius",
  },
  mode: "production",
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1, // disable creating additional chunks
    })
],
}