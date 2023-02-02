const Schema = require('@sanity/schema').default
module.exports = Schema.compile({
  name: 'myBlog',
  types: [
    {
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
    },
    {
      type: 'object',
      name: 'blogPost',
      fields: [
        {
          title: 'Title',
          type: 'string',
          name: 'title'
        },
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                {title: 'Normal', value: 'normal'},
                {title: 'H1', value: 'h1'},
                {title: 'H2', value: 'h2'},
                {title: 'H3', value: 'h3'},
                {title: 'H4', value: 'h4'},
                {title: 'H5', value: 'h5'},
                {title: 'H6', value: 'h6'},
                {title: 'Caption', value: 'caption'},
              ],
              lists: [
                {title: 'Numbered', value: 'number'},
                {title: 'Bullet', value: 'bullet'}
              ],
              marks: {
                decorators: [
                  { title: "Strong", value: "strong" },
                  { title: "Emphasis", value: "em" },
                ],
              }
            }
          ]
        },
        {
          title: 'Slug',
          type: 'slug',
          name: 'slug'
        },

      ]
    }
  ]
})