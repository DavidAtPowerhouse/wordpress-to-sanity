function parseCaption(content) {

  if(!content) {
    return undefined
  }

  if(typeof content === 'string')
  {
    return content.match(/((?:<a [^>]+>\s*)?<img [^>]+>(?:\s*<\/a>)?)(.*)/is);
  }
  return undefined
}

module.exports = content => parseCaption(content)