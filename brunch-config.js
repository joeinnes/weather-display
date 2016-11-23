module.exports = {
  npm: {
    styles: {
      tachyons: ['css/tachyons.css']
    }
  },
  files: {
    javascripts: {
      joinTo: {
        'js/vendor.js': /^(?!app)/,
        'js/app.js': /^app/
      }
    },
    stylesheets: {
      joinTo: {
        'css/app.css': /^app/,
        'css/vendor.css': /^(?!app)/
      }
    }
  },
  plugins: {
    babel: {
      presets: ['es2015']
    }
  }
};