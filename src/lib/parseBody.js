const { JSDOM } = require('jsdom')
const blockTools = require('@sanity/block-tools').default
const sanitizeHTML = require('./sanitizeHTML')
const defaultSchema = require('../../schema/defaultSchema')
const {log,dir} = require('console')
const blockContentType = defaultSchema
  .get('blogPost')
  .fields.find(field => field.name === 'body').type

function htmlToBlocks (html, options) {
  if (!html) {
    return []
  }
  const figureRuleV1 = {
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
          _type: 'imageResource',
          caption: {},
          text: text,
        })
      }
      return undefined;
    }

  };
  const figureRule = {
    deserialize(el, next, block) {
      if (el.tagName.toLowerCase() === 'figure' && el.childNodes.length > 0 )
      {
      let children = [...el.childNodes]
      let imageLink, caption, imageUrl, imageAnchor
      children.forEach((child) => {
        if(child.tagName.toLowerCase() === 'figcaption') {
          if (child.childNodes.length > 0) {
            caption  = [...child.childNodes].reduce(
              (prev, cur) => {
                return prev.textContent + ' ' + cur.textContent
              }
            ).toString().trim()

            imageAnchor = [...child.childNodes].find(n1 => n1.tagName && n1.tagName.toLowerCase() === 'a')
            imageLink = imageAnchor ? imageAnchor.getAttribute('href'): ''

            // imageLinkOld = [...child.childNodes].map(
            //   (childNode) => { return (childNode.tagName && childNode.tagName.toLowerCase() === 'a') ? childNode.getAttribute('href') : ''}
            // )
            // imageUrl =  [...child.childNodes].find(n2 => n2.tagName && n2.tagName.toLowerCase() === 'img').getAttribute('src')
            // imageUrl = imageUrl? imageUrl : [...child.childNodes].find(n3 => n3.childNodes.length > 0 && [...n3.childNodes].find(n4 => n4.tagName && n4.tagName.toLowerCase() === 'img').getAttribute('src'))

            imageUrl =  [...child.childNodes].map(
              (childNode) => {
                if ( childNode.tagName)
                  if(childNode.tagName.toLowerCase() === 'img') {
                    return childNode.getAttribute('src')
                  } else if (childNode.childNodes.length > 0 && [...childNode.childNodes].find( ch => ch.tagName && ch.tagName.toLowerCase() === 'img')) {
                        return [...childNode.childNodes].find( ch => ch.tagName.toLowerCase() === 'img').getAttribute('src')
                  }
                return null;
              }
            ).find(r => r !== null)
          }
        }
        if(child.tagName.toLowerCase() === 'a') {
          dir('a',child)
        }
        if(child.tagName.toLowerCase() === 'img') {
          dir('img',child)
        }
      })
      const result = {
        _type: 'imageResource',
        caption: caption,
        imageLink: imageLink,
        imageUrl: imageUrl
      }
        // log(result)
        return block(result)
      }
      return undefined;
    }
  };
  const blocks = blockTools.htmlToBlocks(sanitizeHTML(html), blockContentType, {
    parseHtml: htmlContent => new JSDOM(htmlContent).window.document,
    rules: [
      {
        deserialize (el, next, block) {
          let imgBlock;
          if (el.tagName.toLowerCase() === 'img') {
              imgBlock = {
                children: [],
                imageUrl: `image@${el
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
                imageUrl: `${el.childNodes[0].getAttribute('src')}`,
                imageLink: `${el.getAttribute('href')}`,
                _type: 'imageResource'
            },annotations))
          }
          return undefined;
        }
      },
      figureRule
    ],
  })
  return blocks
}

module.exports = bodyHTML => htmlToBlocks(bodyHTML)
