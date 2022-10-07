const fs = require('fs')
const path = require('path')
const babelPresetDefault = require('@wordpress/babel-preset-default')
const {autop} = require('@wordpress/autop')
const parseBody = require('../src/lib/parseBody')
const sanitizeHTML = require('../src/lib/sanitizeHTML')
const filepath = path.join(__dirname, '/../src/example-post_content.html')
const console = require('console')

fs.readFile(
  filepath,
  {encoding: "utf-8"},
  function(err, data) {
    if(err){
      console.err(err)
    } else {
      // console.log(parseBody(sanitizeHTML(autop(data))));
      console.dir(parseBody(autop(data)), {depth: null})
    }
})
// looking good, lets try to parse the [caption] shortcodes next.

// const res = parseBody(sanitizeHTML(autop(html)))
// console.log(filepath)
// console.log(res)
// console.table(res)