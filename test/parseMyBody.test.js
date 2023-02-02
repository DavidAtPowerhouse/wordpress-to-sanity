#!/usr/bin/env node

const {autop} = require('@wordpress/autop')
const fs = require('fs')
const path = require('path')
const parseBody = require('../src/lib/parseBody')
const console = require('console')
const csvtojson = require("csvtojson");
const shortcode = require('shortcode-parser')
const argv = require('minimist-lite')(process.argv.slice(2))
const imgCaptionShortcode = require('../src/lib/imgCaptionShortcode')
// a little description
// we will expect arg in: to be the source assumed to be in the data directory
// arg out: will be the destination, assumed to be in the data/out directory

shortcode.add(
'caption',
function(buf, opts) {
    const captionArray = imgCaptionShortcode(buf);
    if(captionArray === undefined) {
      return buf
    }

    // console.log(imgCaptionShortcode(buf));
    if(typeof captionArray === 'object' && captionArray.isArray && captionArray.length > 2) {
      return `<figure><figcaption>${captionArray[1]}</figcaption>${captionArray[2]}</figure>`;
    }
    return buf;
  }
);

async function buildJSONfromCSVEvent(csvFilename, exportedFilename, outputFormat) {

  const posts = [];

  csvtojson().fromStream(fs.createReadStream(csvFilename))
    .on('data', (item) => {
      const myItem = JSON.parse(item);

      const post = {
        title: myItem.post_title,
        body: parseBody(shortcode.parse(autop(myItem.post_content)), {depth: null}),
        _type: "blogPost"
      }
      if(post) {

        if(outputFormat === 'json') {
          posts.push(`${JSON.stringify(post, null, "\t")}\n`)
        } else {

          fs.appendFile(exportedFilename, `${JSON.stringify(post)}\n`, 'utf8', (err) => {
            if (err) throw err;
            console.log("The item:",post.title,"has been saved to",exportedFilename,".")
          })
        }
      }
    })
    .on('end', () => {
      if(outputFormat === 'json') {
        fs.appendFile(exportedFilename, `[${posts.join(',')}]`, 'utf8', (err) => {
          if (err) throw err;
          // log("The file:",exportedFilename,"has been saved.")
        })
      }
    })
    .then((value) => {
      // value is the whole McValue meal.
      // console.log('then...', value[0].post_title)
      // console.log('then')
    })
}

// eslint-disable-next-line consistent-return
async function main () {

  if(!(argv && argv.in)) {
    console.err('nothing to do');
    return undefined
  }
  let outputFormat = 'ndjson';
  if(argv.mode && argv.mode === 'json') {
     outputFormat = 'json';
  }
  const filename = path.join(__dirname, '/../data/',argv.in)
  const dateString = new Date().toISOString().replace(/[T :]/gim, '-').substring(0, 19)
  const jsonOutputFilename = `${argv.in.replace('.csv','')}-${dateString}.${outputFormat}`;
  const transformed = path.join(__dirname,'/../data/test-out', jsonOutputFilename)
  await buildJSONfromCSVEvent(filename, transformed, outputFormat)
}

main().then(r => r)
