#!/usr/bin/env node

/* eslint-disable id-length, no-console, no-process-env, no-sync, no-process-exit */
const fs = require('fs')
const { log, dir, error } = require('console')
// const parseDate = require('./lib/parseDate')
const parseBody = require('../src/lib/parseBody')
const path = require("path");
const csvtojson = require("csvtojson")
const {autop} = require('@wordpress/autop')
const shortcode = require('shortcode-parser')
const { DateTime } = require('luxon')
const slugify = require('slugify')


shortcode.add(
  'caption',
  function(buf, opts) {
    return `<figure><figcaption>${buf}</figcaption></figure>`;
  }
);

async function buildJSONfromCSVEvent(csvFilename, exportedFilename, consoleOut = true) {

  csvtojson().fromStream(fs.createReadStream(csvFilename))
    .on('data', (item) => {

      const myItem = JSON.parse(item);
      const post = {
        title: myItem.post_title,
        body: parseBody(shortcode.parse(autop(myItem.post_content)), {depth: null}),
        _type: "blogPost",
        slug: {
          _type: 'slug',
          current: slugify(myItem.post_name)
        },
        // postName: myItem.post_name,
        // dateModified: myItem.post_modified,
        // postThumbnail: myItem.post_thumbnail,
      }

      if (post) {
        if (consoleOut) {
          console.dir(post, {depth:null})
        } else { //write to file
          fs.appendFile(
            exportedFilename,
            `${JSON.stringify(post)}\n`,
            'utf8',
            (err) => {
              if (err) throw err;
            }
          )
        }

      }
    })
    .on('end', () => {})
    .then((value) => {
      // value is the whole McValue meal.
    })
}

async function main () {
  const csvInputFilename = 'post-export-10.csv'
  const filename = path.join(__dirname,'/../data', csvInputFilename)
  const dateString = DateTime.now().setZone('Australia/Sydney').toFormat('y-MM-dd-HH-mm-ss')
  const jsonOutputFilename = `${csvInputFilename.replace('.csv','')}-${dateString}.ndjson`;
  const transformed = path.join(__dirname,'/../data/out', jsonOutputFilename)

  buildJSONfromCSVEvent(filename, transformed, false)

}

main()
