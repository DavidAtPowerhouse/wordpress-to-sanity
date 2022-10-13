const fs = require('fs')
const path = require('path')
const {autop} = require('@wordpress/autop')
const shortcode = require('shortcode-parser')
const parseBody = require('../src/lib/parseBody')
const filepath = path.join(__dirname, '/../import/example-post_content_captions.html')
const console = require('console')
shortcode.add(
'caption',
function(buf, opts) {
    return `<figure><figcaption>${buf}</figcaption></figure>`;
  }
);
fs.readFile(
  filepath,
  {encoding: "utf-8"},
  function(err, data) {
    const html = shortcode.parse(autop(data));
    if(err){
      console.err(err)
    } else {
      // console.dir(html);
      console.dir(parseBody(html),{depth:null});
    }
})
// looking good, lets try to parse the [caption] shortcodes next.
