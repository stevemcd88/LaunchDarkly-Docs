/* eslint-disable @typescript-eslint/no-var-requires */
const { queries } = require('./src/utils/algolia')

module.exports = {
  siteMetadata: {
    title: 'LaunchDarkly Docs',
    description: 'LaunchDarkly documentation',
    author: '@launchdarkly',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-algolia',
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY,
        queries,
        chunkSize: 10000, // default: 1000
      },
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        remarkPlugins: [require('remark-slug')],
      },
    },
    'gatsby-plugin-theme-ui',
    {
      resolve: 'gatsby-theme-style-guide',
      options: {
        // sets path for generated page
        basePath: '/design-system',
      },
    },
    'gatsby-plugin-react-helmet-async',
    'gatsby-plugin-typescript',
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'navigationData',
        path: `${__dirname}/src/content/navigationData.json`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/assets/images`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/content/topics`,
        name: 'mdx',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/readme`,
        name: 'readme',
      },
    },
    {
      resolve: 'gatsby-plugin-s3',
      options: {
        bucketName: 'launchdarkly-docs-staging',
        protocol: 'https',
        hostname: 'docs-stg.launchdarkly.com',
        enableS3StaticWebsiteHosting: false,
      },
    },
    {
      resolve: 'gatsby-plugin-svgr-loader',
      options: {
        rule: {
          options: {
            svgoConfig: {
              plugins: [
                { removeAttrs: { attrs: 'fill' } },
                {
                  removeViewBox: false,
                },
                {
                  removeDimensions: true,
                },
              ],
            },
          },
          include: /icons/,
        },
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'git-gatsby',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'assets/images/launchdarkly-logo.png', // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // 'gatsby-plugin-offline',
  ],
}
