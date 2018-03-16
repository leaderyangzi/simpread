
const webpack = require( 'webpack' ),
    plugins = [

      // public reqire( xxx )
      new webpack.ProvidePlugin({
        React    : 'react',
        ReactDOM : 'react-dom',
        Notify   : 'notify',
      }),

      // chunk files
      new webpack.optimize.CommonsChunkPlugin({
        names     : [ 'vendors', 'common' ],
        minChunks : Infinity
      }),

      // defined environment variable
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify( 'production' ) // or development
      }),

    ],

    // conditions environment
    isProduction = function () {
      return process.env.NODE_ENV === 'production';
    },

    // only when environment variable is 'production' call
    deploy = ( function () {
      var CopyWebpackPlugin  = require( 'copy-webpack-plugin'  ),
          CleanWebpackPlugin = require( 'clean-webpack-plugin' );

      // development verify
      if ( !isProduction() ) {
        // copy files
        plugins.push(
          new CopyWebpackPlugin([
            { from   : 'src/options/options.html',        to : '../options/' },
            { from   : 'src/options/custom.html',         to : '../options/' },
            { from   : 'src/options/sitemgr.html',        to : '../options/' },
            //{ context: 'src/assets/css/', from : "*" ,    to : '../assets/css' },
            //{ context: 'src/assets/images/', from : "*" , to : '../assets/images' },
            //{ context: 'src/_locales/',    from : "*/*" , to : '../_locales/' },
          ])
        )
      }

      // environment verify
      if ( isProduction() ) {

        // delete publish folder
        plugins.push(
          new CleanWebpackPlugin([ 'publish' ], {
            verbose: true,
            dry    : false,
          })
        );

        // copy files
        plugins.push(
          new CopyWebpackPlugin([
            { from   : "ext/manifest.json" ,              to : '../' },
            { from   : "ext/website_list.json" ,          to : '../' },
            { from   : 'src/options/options.html',        to : '../options/' },
            { from   : 'src/options/custom.html',         to : '../options/' },
            { from   : 'src/options/sitemgr.html',        to : '../options/' },
            { context: 'ext/assets/images/', from : "*" , to : '../assets/images' },
            { context: 'ext/_locales/',    from : "*/*" , to : '../_locales/' },
          ])
        );

        // call uglifyjs plugin
        plugins.push(
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              sequences: true,
              dead_code: true,
              conditionals: true,
              booleans: true,
              unused: true,
              if_return: true,
              join_vars: true,
              drop_console: true
            },
            mangle: {
              except: [ '$', 'exports', 'require' ]
            },
            output: {
              comments: false
            }
          })
        );

      }
    })(),

    // webpack config
    config = {
      entry: {

        common : [
          'babel-polyfill',

          'jquery',

          'storage',
          'message',
          'browser',
          'version',
          'menu',
          'watch',
          'util',
        ],

        vendors : [

          // react
          './node_modules/react/dist/react.min.js',
          './node_modules/react-dom/dist/react-dom.min.js',

          // vendors
          //'minimatch',
          //'to-markdown',
          'velocity',
          'filesaver',
          'dom2image',
          'notify',

          // only read
          //'pangu',
          //'mousetrap',
          //'progressbar',
          //'util',
          //'highlight',
          //'output',

          // service
          'export',
          'theme',
          'stylesheet',
          'config',

          // module
          'focusopt',
          'readopt',
          'themesel',
          'shortcuts',
          'include',
          'exclude',
          'name',
          'url',
          'modals',

          // olny options
          //'welcome',
          //'commonopt',
          //'authorize',
          //'labsopt',
          //'unrdist',
          //'about',
          //'timeago',

          // mduikit
          'tooltip',
          'waves',
          'textfield',
          'button',
          'selectfield',

          // only read
          //'fab',
          //'progress',
          //'dialog',

          // option custom
          //'switch',
          //'tabs',
          //'sidebar',
          //'list',
        ],

        contentscripts : './ext/contentscripts.js',
        background     : './ext/background.js',
        options        : './src/options/options.js',
        custom         : './src/options/custom.js',
        sitemgr        : './src/options/sitemgr.js',
      },

      output: {
        path     :  isProduction() ? './publish/bundle' : './ext/bundle',
        filename : '[name].js'
      },

      devServer: {
        inline: true,
        port  : 7777
      },

      plugins: plugins,

      module: {
        loaders: [{
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
              presets: [ 'es2015', 'stage-0', 'react' ]
            }
        },
        { test: /\.css$/,           loader: 'style!css!postcss' },
        { test: /\.(png|jpg|gif)$/, loader: 'url?limit=12288'   },
        {
          test  : require.resolve( './src/vender/jquery-2.1.1.min.js' ),
          loader: 'expose?jQuery!expose?$'
        },
        {
          test  : require.resolve( './src/vender/mousetrap.min.js' ),
          loader: 'expose?Mousetrap'
        }
        ]
      },

      postcss: function () {
        return [
          require( 'postcss-cssnext' )()
        ]
      },

      node: {
        fs: 'empty'
      },

      resolve: {
        alias : {

          notify_css : __dirname + '/src/vender/notify/notify.css',
          carous_css : __dirname + '/src/vender/carousel/carousel.css',

          markdown   : __dirname + '/node_modules/to-markdown/dist/to-markdown.js',
          epubpress  : __dirname + '/node_modules/epub-press-js/build/index.js',

          jquery     : __dirname + '/src/vender/jquery-2.1.1.min.js',
          mousetrap  : __dirname + '/src/vender/mousetrap.min.js',
          velocity   : __dirname + '/src/vender/velocity.min.js',
          timeago    : __dirname + '/src/vender/timeago.min.js',
          carousel   : __dirname + '/src/vender/carousel/carousel.js',
          dom2image  : __dirname + '/src/vender/dom2image.min.js',
          filesaver  : __dirname + '/src/vender/filesaver.min.js',
          instapaper : __dirname + '/src/vender/instapaper.js',

          util       : __dirname + '/ext/service/util.js',
          local      : __dirname + '/ext/service/local.js',
          storage    : __dirname + '/ext/service/storage.js',
          message    : __dirname + '/ext/service/message.js',
          browser    : __dirname + '/ext/service/browser.js',
          theme      : __dirname + '/ext/service/theme.js',
          stylesheet : __dirname + '/ext/service/stylesheet.js',
          config     : __dirname + '/ext/service/config.js',
          version    : __dirname + '/ext/service/version.js',
          menu       : __dirname + '/ext/service/menu.js',
          watch      : __dirname + '/ext/service/watch.js',
          export     : __dirname + '/ext/service/export.js',
          highlight  : __dirname + '/ext/service/highlight.js',
          output     : __dirname + '/ext/service/output.js',

          focus      : __dirname + '/ext/focus/focus.js',
          controlbar : __dirname + '/ext/focus/controlbar.jsx',

          read       : __dirname + '/ext/read/read.jsx',
          toc        : __dirname + '/ext/read/toc.jsx',
          special    : __dirname + '/ext/read/special.jsx',
          readctlbar : __dirname + '/ext/read/controlbar.jsx',
          schedule   : __dirname + '/ext/read/progressbar.jsx',

          keyboard   : __dirname + '/ext/module/keyboard.js',
          modals     : __dirname + '/ext/module/modals.jsx',
          focusopt   : __dirname + '/ext/module/focus.jsx',
          readopt    : __dirname + '/ext/module/read.jsx',
          commonopt  : __dirname + '/ext/module/common.jsx',
          labsopt    : __dirname + '/ext/module/labs.jsx',
          about      : __dirname + '/ext/module/about.jsx',
          unrdist    : __dirname + '/ext/module/unrdist.jsx',
          welcome    : __dirname + '/ext/module/welcome.jsx',
          authorize  : __dirname + '/ext/module/authorize.jsx',
          siteeditor : __dirname + '/ext/module/siteeditor.jsx',
          editor     : __dirname + '/ext/module/common/editor.jsx',
          themesel   : __dirname + '/ext/module/common/theme.jsx',
          shortcuts  : __dirname + '/ext/module/common/shortcuts.jsx',
          include    : __dirname + '/ext/module/common/include.jsx',
          exclude    : __dirname + '/ext/module/common/exclude.jsx',
          name       : __dirname + '/ext/module/common/name.jsx',
          url        : __dirname + '/ext/module/common/url.jsx',

          wavess     : __dirname + '/src/vender/waves/waves.js',
          notify     : __dirname + '/src/vender/notify/notify.js',

          textfield  : __dirname + '/src/vender/mduikit/textfield.jsx',
          fab        : __dirname + '/src/vender/mduikit/fab.jsx',
          button     : __dirname + '/src/vender/mduikit/button.jsx',
          selectfield: __dirname + '/src/vender/mduikit/selectfield.jsx',
          dropdown   : __dirname + '/src/vender/mduikit/dropdown.jsx',
          switch     : __dirname + '/src/vender/mduikit/switch.jsx',
          tabs       : __dirname + '/src/vender/mduikit/tabs.jsx',
          progress   : __dirname + '/src/vender/mduikit/progress.jsx',
          sidebar    : __dirname + '/src/vender/mduikit/sidebar.jsx',
          list       : __dirname + '/src/vender/mduikit/list.jsx',
          dialog     : __dirname + '/src/vender/mduikit/dialog.jsx',
          tooltip    : __dirname + '/src/vender/mduikit/tooltip.jsx',
          waves      : __dirname + '/src/vender/mduikit/waves.js',

          pureread   : __dirname + '/src/vender/pureread/pureread.js',
          prplugin   : __dirname + '/src/vender/pureread/plugin.js',

        }
      }

};

module.exports = config;