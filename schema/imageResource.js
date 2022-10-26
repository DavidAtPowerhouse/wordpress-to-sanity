export default {
  name: 'imageResource',
  title: 'Image Resource',
  type: 'object',
  fields: [{
    name: 'imageLink',
    type: 'url',
    title: 'Image Link'
  },{
    title: 'Caption',
    name: 'caption',
    type: 'text',
  },{
    title: 'Image URL',
    name: 'imageUrl',
    type: 'url'
  }],
}