#!/usr/bin/env node

/* eslint-disable id-length, no-console, no-process-env, no-sync, no-process-exit */
const fs = require('fs')
const { log, dir, error } = require('console')
// const parseDate = require('./lib/parseDate')
const parseBody = require('./lib/parseBody')
const slugify = require('slugify')
const path = require("path");
const csvtojson = require("csvtojson")
const {autop} = require('@wordpress/autop')
const shortcode = require('shortcode-parser')
const ndjson = require('ndjson')

shortcode.add(
  'caption',
  function(buf, opts) {
    return `<figure><figcaption>${buf}</figcaption></figure>`;
  }
);

async function buildJSONfromCSVEvent(csvFilename, exportedFilename) {

  const posts = [];
  csvtojson().fromStream(fs.createReadStream(csvFilename))
    .on('data', (item) => {

      const myItem = JSON.parse(item);
      // console.dir(JSON.parse(item), {depth: null})
      const post = {
        title: myItem.post_title,
        body: parseBody(shortcode.parse(autop(myItem.post_content)), {depth: null}),
        _type: "blogPost"
      }
      if(post) {
        // posts.push(post)
        fs.appendFile(exportedFilename, JSON.stringify(post)+"\n", 'utf8', (err) => {
          if  (err) throw err;
          // log("The file:",exportedFilename,"has been saved.")
        })
      }
    })
    .on('end', () => {
      // console.log('event stream: end')
      // fs.writeFile(exportedFilename, JSON.stringify(posts, null, "\t"), 'utf8', (err) => {
      //   if  (err) throw err;
        // log("The file:",exportedFilename,"has been saved.")
      // })
      // log(posts.length,"items written to file")
      // console.dir(JSON.stringify(posts), {depth: null})
    })
    .then((value) => {
    // value is the whole McValue meal.
    // console.log('then...', value[0].post_title)
    // console.log('then')
  })
}


async function buildJSONfromCSVSubscribe (csvFilename) {
  const onError = (e) => {
    error( new Error(e))
  };
  const onComplete = () => {
    log("...we are done here.")
  };
  const posts = [];
  csvtojson().fromStream(fs.createReadStream(csvFilename))
    .subscribe((item, lineNumber) => {
      // log("lineNumber: ", lineNumber)
      return new Promise((resolve, reject) => {
        const myBody = {
          title: item.post_title,
          body: parseBody(shortcode.parse(autop(item.post_content)), {depth: null})
        }
        // dir(myBody,{depth:null}) // this dumps to command line okay

        resolve(myBody) // and resolve doesn't do anything so far.
      })
      .then( (value) => {
        posts.push(value)
        console.dir(value, {depth: null})
      })

    }, onError, onComplete)

    .then((value) => {
      return posts;
      // const thenPost = { title: post.post_title}
      // posts.push(thenPost)
    })
  return posts; // this doesn't go anywhere...
}

async function buildJSONfromCSV2 (csvFilename) {
  const onError = (e) => {
    log("error: ", e)
  };
  const onComplete = () => {
    log("...we are done here.")
  };

  const posts = []

  const json = await csvtojson().fromFile(csvFilename)
    .subscribe((item, lineNumber) => {
      return new Promise((resolve, reject) => {
        const post  =  {
          _type: 'post',
          title: item.post_title,
          slug: {
            current: slugify(post_title, {lower: true})
          },
          excerpt: post_excerpt,
          body: parseBody(shortcode.parse(autop(post_content)), {depth: null})
        }
        resolve(post)
      }).then( (value) => {
        posts.push(value)
      })
    }, onError, onComplete);


  return json;
}


async function main () {
  const csvInputFilename = 'post-20221004_062040-export-trimmed-10.csv'
  const filename = path.join(__dirname,'/../data', csvInputFilename)
  const dateString = new Date().toISOString().replace(/[T :]/gim, '-').substring(0, 19)
  const jsonOutputFilename = `${csvInputFilename.replace('.csv','')}-${dateString}.json`;
  const transformed = path.join(__dirname,'/../data/out', jsonOutputFilename)
  // const output = await
  buildJSONfromCSVEvent(filename, transformed)

  // dir(output, {depth: null});
}

main()
