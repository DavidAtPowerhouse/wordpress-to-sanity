const { JSDOM } = require('jsdom')
const blockTools = require('@sanity/block-tools').default
const sanitizeHTML = require('./sanitizeHTML')
const defaultSchema = require('../../schema/defaultSchema')
// const {log,dir} = require('console')
const blockContentType = defaultSchema
  .get('blogPost')
  .fields.find(field => field.name === 'body').type

function htmlToBlocks (html, options) {
  if (!html) {
    return []
  }

  const figCaption = (el) => {
    const children = [...el.childNodes]
    let caption
    children.forEach((child) => {
      if(child.tagName.toLowerCase() === 'figcaption') {
        if (child.childNodes.length > 0) {
          caption  = [...child.childNodes].reduce(
            (prev, cur) => {
              return `${prev.textContent} ${cur.textContent}`
            }
          ).toString().trim()
          return caption
        }
      }
      return undefined
    })
  }

  const imageLink = (el) => {
    // find <a>
    const imageAnchor = [...el.childNodes]
      .find(
        n1 => n1.tagName &&
        n1.tagName.toLowerCase() === 'a'
        )
    return imageAnchor ? imageAnchor.getAttribute('href'): ''
  }

  const imageUrl = (el) => {
    return [...el.childNodes].map(
      (childNode) => {
        if (childNode.tagName) {
          if(childNode.tagName.toLowerCase() === 'img') {
            return childNode.getAttribute('src')
          } else if (childNode.childNodes.length > 0 && [...childNode.childNodes].find( ch => ch.tagName && ch.tagName.toLowerCase() === 'img')) {
            return [...childNode.childNodes].find( ch => ch.tagName.toLowerCase() === 'img').getAttribute('src')
          }
        }
        return null;
      }
    ).find(r => r !== null)
  }

  const imageResource = {
    deserialize(el, next, block) {
      let result
      if (el.tagName.toLowerCase() === 'figure' && el.childNodes.length > 0) {
        result = {
          _type: 'imageResource',
          caption: figCaption(el),
          imageLink: imageLink(el),
          imageUrl: imageUrl(el)
        }
        return block(result)
      }
      if( el.tagName.toLowerCase() === 'a' && el.childNodes.length > 0) {
        result = {
          _type: 'imageResource',
          caption: undefined,
          imageLink: imageLink(el),
          imageUrl: imageUrl(el)
        }
        return block(result)
      }

      if( el.tagName.toLowerCase() === 'img') {
        result = {
          _type: 'imageResource',
          caption: undefined,
          imageLink: undefined,
          imageUrl: imageUrl(el)
        }
        return block(result)

      }



      return undefined
    }
  }

  const figureRule = {
    deserialize(el, next, block) {
      if (el.tagName.toLowerCase() === 'figure' && el.childNodes.length > 0)
      {
      const children = [...el.childNodes]
      let imageLink, caption, imageUrl, imageAnchor
      children.forEach((child) => {
        if(child.tagName.toLowerCase() === 'figcaption') {
          if (child.childNodes.length > 0) {
            caption  = [...child.childNodes].reduce(
              (prev, cur) => {
                return `${prev.textContent} ${cur.textContent}`
              }
            ).toString().trim()

            // find <a>
            imageAnchor = [...child.childNodes].find(n1 => n1.tagName && n1.tagName.toLowerCase() === 'a')
            imageLink = imageAnchor ? imageAnchor.getAttribute('href'): ''

            //
            imageUrl =  [...child.childNodes].map(
              (childNode) => {
                if (childNode.tagName) {
                  if(childNode.tagName.toLowerCase() === 'img') {
                    return childNode.getAttribute('src')
                  } else if (childNode.childNodes.length > 0 && [...childNode.childNodes].find( ch => ch.tagName && ch.tagName.toLowerCase() === 'img')) {
                        return [...childNode.childNodes].find( ch => ch.tagName.toLowerCase() === 'img').getAttribute('src')
                  }
                }
                return null;
              }
            ).find(r => r !== null)
          }
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
      imageResource
    ],
  })
  return blocks
}

module.exports = bodyHTML => htmlToBlocks(bodyHTML)
