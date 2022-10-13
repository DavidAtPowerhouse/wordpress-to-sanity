const { JSDOM } = require('jsdom')
const blockTools = require('@sanity/block-tools').default
const sanitizeHTML = require('./sanitizeHTML')
const defaultSchema = require('../../schema/defaultSchema')
const console = require('console')
const blockContentType = defaultSchema
  .get('blogPost')
  .fields.find(field => field.name === 'body').type

function htmlToBlocks (html, options) {
  if (!html) {
    return []
  }
  const figureRule = {
    deserialize(el, next, block) {
      if (el.tagName.toLowerCase() === 'figure' &&
        el.childNodes.length > 0 &&
        el.childNodes[0].tagName &&
        el.childNodes[0].tagName.toLowerCase() === 'figcaption'
      ) {
        let text = '';
        const childNodes = (el.children[0] &&
          el.childNodes[0].tagName.toLowerCase() === 'figcaption'
        ) ? el.childNodes[0].childNodes : el.childNodes;
        childNodes.forEach(node => {
          text += node.textContent
        })
        return block({
          _type: 'span',
          marks: ['caption'],
          text: text,
        })
      }
      return undefined;
    }
  };

  const blocks = blockTools.htmlToBlocks(sanitizeHTML(html), blockContentType, {
    parseHtml: htmlContent => new JSDOM(htmlContent).window.document,
    rules: [
      {
        deserialize (el, next, block) {
          // Special case for code blocks (wrapped in pre and code tag)
          if (el.tagName.toLowerCase() !== 'pre') {
            return undefined
          }
          const code = el.children[0]
          let text = ''
          if (code) {
            const childNodes =
              code && code.tagName.toLowerCase() === 'code'
                ? code.childNodes
                : el.childNodes
            childNodes.forEach(node => {
              text += node.textContent
            })
          } else {
            text = el.textContent
          }
          if(!text) {
            return undefined
          }
          return block({
            children: [],
            _type: 'code',
            text: text
          })
        }
      },
      {
        deserialize (el, next, block) {
          let imgBlock;
          if (el.tagName.toLowerCase() === 'img') {
              imgBlock = {
                children: [],
                _sanityAsset: `image@${el
                  .getAttribute('src')
                  .replace(/^\/\//, 'https://')}`,
              };
            if(el.getAttribute('alt') && el.getAttribute('alt') !== "") {
              Object.assign(imgBlock,{caption:`${el.getAttribute('alt')}`}, )
            }
            return block(imgBlock)
          }

          // Only convert block-level images, for now
          return undefined
        }
      },
      {
        deserialize(el, next, block) {
          if (el.tagName.toLowerCase() === 'a' &&
            el.childNodes.length > 0 &&
            el.childNodes[0].tagName &&
            el.childNodes[0].tagName.toLowerCase() === 'img'

          ) {
            let annotations;
            if(el.childNodes[0].getAttribute('alt')){
              annotations = { annotations:{alternativeText: el.childNodes[0].getAttribute('alt') }}
            }
            return block(Object.assign({
              _sanityAsset: `image@${el.childNodes[0].getAttribute('src')}`,
                imageLink: `${el.getAttribute('href')}`
            },annotations))
          }
          return undefined;
        }
      },
    ],
  })
  return blocks
}

module.exports = bodyHTML => htmlToBlocks(bodyHTML)
