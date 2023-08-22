const autoprefixer = require('autoprefixer')
const scrollbar = require('postcss-scrollbar')
const postcssNesting = require('postcss-nesting')

const config = {
	plugins: [postcssNesting, scrollbar, autoprefixer]
}

module.exports = config
