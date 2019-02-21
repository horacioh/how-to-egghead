const { createFilePath } = require('gatsby-source-filesystem')

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === 'Mdx') {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: 'slug',
      node,
      value: `${value}`,
    })
  }
}
const path = require('path')

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions
  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMdx(sort: { order: ASC, fields: [frontmatter___chapter] }) {
              edges {
                node {
                  id
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    slug
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.error(result.errors)
          reject(result.errors)
        }

        const guides = result.data.allMdx.edges

        guides.forEach(({ node }, index) => {
          // Redirect index to /how-to-egghead so that we have follow up navigation
          createRedirect({
            fromPath: `/`,
            isPermanent: true,
            redirectInBrowser: true,
            toPath: `/what-is-egghead`,
          })
          const previous =
            index === guides.length - 1 ? null : guides[index + 1].node
          const next = index === 0 ? null : guides[index - 1].node
          createPage({
            path: node.frontmatter.slug,
            component: path.resolve(`./src/templates/chapter.js`),
            context: { id: node.id, previous, next },
          })
        })
      })
    )
  })
}