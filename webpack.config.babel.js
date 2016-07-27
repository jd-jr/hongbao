import path from 'path';
import webpack from 'webpack';
import HtmlwebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin  from 'extract-text-webpack-plugin';
import precss from 'precss';
import autoprefixer from 'autoprefixer';

//线上环境
const ip = 'static.jdpay.com';
const port = 443; // https 默认端口号为443

//测试环境
/*const ip = 'hongbao.jdpay.com';
const port = 8083;*/

const hotDevServer = 'webpack/hot/dev-server';
// https://github.com/webpack/webpack-dev-server
const webpackDevServer = `webpack-dev-server/client?${port === 443 ? 'https' : 'http'}://${ip}:${port}`;

const appPath = path.resolve(__dirname, 'app');

let webpackConfig = {
  // eslint 配置
  eslint: {
    emitError: true, // 验证失败，终止
    configFile: '.eslintrc'
  },
  cache: true, //开启缓存,增量编译
  debug: true, //开启 debug 模式
  devtool: 'source-map', //生成 source map文件
  stats: {
    colors: true, //打印日志显示颜色
    reasons: true //打印相关模块被引入
  },
  devServer: {
    contentBase: './app',
    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.
    // 配置路径，重写 url
    // 官网地址 https://github.com/bripkens/connect-history-api-fallback
    historyApiFallback: {
      index: '/m-hongbao/'
    },
    hot: true,
    stats: {
      colors: true,
      reasons: true
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 300
    },
    quiet: false, // 设为true，不把任何信息输出到控制台
    publicPath: '/m-hongbao/',
    // 代理设置
    proxy: {
      '/redbag/*': {
        target: 'http://localhost:3000',
        secure: false
      }
    }
  },
  postcss () {
    return {
      defaults: [precss, autoprefixer],
      cleaner: [autoprefixer({browsers: ['last 2 version', 'chrome >=30', 'Android >= 4.3']})]
    };
  },

  resolve: {
    root: [appPath], // 设置要加载模块根路径，该路径必须是绝对路径
    //自动扩展文件后缀名
    extensions: ['', '.js', '.jsx', '.css', '.json']
  },

  // 入口文件 让webpack用哪个文件作为项目的入口
  entry: {
    index: ['./app/scripts/index.js', webpackDevServer, hotDevServer],
  },

  // 出口 让webpack把处理完成的文件放在哪里
  output: {
    // 编译输出目录, 不能省略
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js', //文件名称
    publicPath: '/m-hongbao/' //资源路径
  },

  module: {
    // https://github.com/MoOx/eslint-loader
    preLoaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules.*!/,
      loader: 'eslint'
    }],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        exclude: /node_modules/,
        cacheDirectory: true // 开启缓存
      },
      // https://github.com/webpack/extract-text-webpack-plugin 单独引入css文件
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader', 'postcss-loader?pack=cleaner')
      },
      // https://github.com/webpack/url-loader
      {
        test: /\.(png|jpg|gif|woff|woff2|svg)$/,
        loader: 'url?limit=10000', // 10kb
        query: {
          mimetype: 'image/png'
        }
      },
      {
        test: /\.(mp4|ogg)$/,
        loader: 'file-loader'
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 热部署替换模块

    new ExtractTextPlugin('[name].[hash].css', {
      disable: false,
      allChunks: true
    })
  ]
};


//创建 HtmlWebpackPlugin 的实例
// https://www.npmjs.com/package/html-webpack-plugin
const entry = webpackConfig.entry;

// 为 HtmlwebpackPlugin 设置配置项，与 entry 键对应，根据需要设置其参数值
const htmlwebpackPluginConfig = {
  index: {
    title: '实物红包'
  }
};

for (let key in entry) {
  if (entry.hasOwnProperty(key) && key !== 'vendors') {
    webpackConfig.plugins.push(
      new HtmlwebpackPlugin({
        title: htmlwebpackPluginConfig[key].title,
        template: path.resolve(appPath, 'templates/layout-dev.html'),
        filename: `${key}.html`,
        //chunks这个参数告诉插件要引用entry里面的哪几个入口
        chunks: [key, 'vendors'],
        //要把script插入到标签里
        inject: 'body'
      })
    );
  }
}

export default {
  webpackConfig,
  ip,
  port
};

