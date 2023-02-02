function parseCaption(content) {

  if(!content) {
    return undefined
  }

  // const pattern = "/((?:<a [^>]+>\\s*)?<img [^>]+>(?:\\s*<\\/a>)?)(.*)/is"
  const regex = /((?:<a [^>]+>\s*)?<img [^>]+>(?:\s*<\/a>)?)(.*)/is
  if(typeof content === 'string')
  {
    return content.match(regex);
  }
  return undefined
}

module.exports = content => parseCaption(content)