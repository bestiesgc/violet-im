const autoprefixer = require('autoprefixer')
const scrollbar = require('postcss-scrollbar')

const config = {
	plugins: [scrollbar, autoprefixer]
}

module.exports = config
