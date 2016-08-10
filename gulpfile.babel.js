import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import opn from 'opn';
import moment from 'moment';
import md5File from 'md5-file';
import chalk from 'chalk';
import filePackage from 'file-package';
import config from './webpack.config.babel';
import exampleConfig from './webpack.example.config.babel';
import productionConfig from './webpack.production.config.babel';
import dllConfig from './webpack.dll.config.babel';

const $ = gulpLoadPlugins();

// webpack gulp 配置可参考 https://github.com/webpack/webpack-with-common-libs/blob/master/gulpfile.js

//利用sass生成styles任务，开发环境不压缩，线上环境设为 compressed
let outputStyle = 'expanded';
gulp.task('styles', () => {
  return gulp.src('app/sass/*.scss')
    .pipe($.sass.sync({
      outputStyle, // 展开的
      precision: 10, //数字精度
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 3 version', 'Android >= 4.3', 'iOS >=8.1'],
      flexbox: 'no-2009',
      remove: false // 是否自动删除过时的前缀
    }))
    .pipe(gulp.dest('app/styles'));
});

gulp.task('styles:example', () => {
  return gulp.src('example/sass/*.scss')
    .pipe($.sass.sync({
      outputStyle: 'expanded', // 展开的
      precision: 10, //数字精读
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 version', 'chrome >=30', 'Android >= 4.3'],
      flexbox: 'no-2009',
      remove: false // 是否自动删除过时的前缀
    }))
    .pipe(gulp.dest('example/styles'));
});

//复制替换文件，分开发、正式环境和本地服务环境
//备选插件 https://www.npmjs.com/package/gulp-copy-rex
//服务环境，测试环境
gulp.task('copy:server', () => {
  const paths = [
    {src: 'app/scripts/config/index.dev.js', dest: 'app/scripts/config/index.js'},
    {src: 'app/scripts/store/configureStore.dev.js', dest: 'app/scripts/store/index.js'},
    {src: 'app/scripts/containers/Root.dev.js', dest: 'app/scripts/containers/Root.js'},
    {src: 'node_modules/eruda/eruda.min.js', dest: 'app/eruda.min.js'},
  ];
  return $.copy2(paths);
});

// 线上环境
gulp.task('copy:server:prod', () => {
  const paths = [
    {src: 'app/scripts/config/index.prod.js', dest: 'app/scripts/config/index.js'},
    {src: 'app/scripts/store/configureStore.dev.js', dest: 'app/scripts/store/index.js'},
    {src: 'app/scripts/containers/Root.dev.js', dest: 'app/scripts/containers/Root.js'},
    {src: 'node_modules/eruda/eruda.min.js', dest: 'app/eruda.min.js'},
  ];
  return $.copy2(paths);
});

//开发环境
gulp.task('copy:dev', ['clean'], () => {
  const paths = [
    {src: 'app/scripts/config/index.dev.js', dest: 'app/scripts/config/index.js'},
    {src: 'app/scripts/store/configureStore.prod.js', dest: 'app/scripts/store/index.js'},
    {src: 'app/scripts/containers/Root.prod.js', dest: 'app/scripts/containers/Root.js'},
    {src: 'app/favicon.ico', dest: 'dist/favicon.ico'},
    {src: 'node_modules/eruda/eruda.min.js', dest: 'dist/eruda.min.js'},
  ];
  return $.copy2(paths);
});

//正式环境,打包使用
gulp.task('copy:prod', ['clean'], () => {
  const paths = [
    {src: 'app/scripts/config/index.prod.js', dest: 'app/scripts/config/index.js'},
    {src: 'app/scripts/store/configureStore.prod.js', dest: 'app/scripts/store/index.js'},
    {src: 'app/scripts/containers/Root.prod.js', dest: 'app/scripts/containers/Root.js'},
    {src: 'app/favicon.ico', dest: 'dist/favicon.ico'},
    {src: 'node_modules/eruda/eruda.min.js', dest: 'dist/eruda.min.js'},
  ];
  return $.copy2(paths);
});

//优化图片
gulp.task('images-guide', () => {
  return gulp.src('app/images/guide/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images/guide'))
});

gulp.task('images-strategy', () => {
  return gulp.src('app/images/strategy/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images/strategy'))
});

// 计算文件大小
gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: '文件大小：', gzip: true}));
});

//把 json 测试数据复制到 dist 目录下
gulp.task('copy-json', () => {
  return gulp.src('app/json/**')
    .pipe(gulp.dest('dist/json'));
});

/**
 * 压缩
 * 文件名格式（根据需要自定义）： fe-m-hongbao-YYYYMMDDTHHmm
 * 由于 gulp 压缩插件 gulp-zip 不能指定 package Root, 故采用 file-package 来压缩打包
 */
const filePath = `fe-m-hongbao-${moment().format('YYYYMMDDTHHmm')}`;
const fileName = `${filePath}.zip`;
gulp.task('zip', () => {
  filePackage('dist', `zip/${fileName}`, {
    packageRoot: filePath
  });
});

/**
 * 生成压缩后文件 md5
 */
gulp.task('md5', ['size', 'zip'], () => {
  md5File(`zip/${fileName}`, (error, md5) => {
    if (error) {
      return console.log(error);
    }
    console.log(chalk.green('生成的压缩文件为'));
    console.log(chalk.magenta(fileName));
    console.log(chalk.green('生成的 md5 为'));
    console.log(chalk.magenta(md5));
  })
});

// 打包
gulp.task('package', ['copy-json'], () => {
  gulp.start('md5');
});

//清理临时和打包目录
gulp.task('clean', () => {
  return gulp.src(['dist', 'zip'])
    .pipe($.clean({force: true}));
});

gulp.task('webpack:server', () => {
  const {webpackConfig, ip, port} = config;

  if (port === 443) {
    webpackConfig.devServer.https = true;
  }

  // Start a webpack-dev-server
  const compiler = webpack(webpackConfig);

  const server = new WebpackDevServer(compiler, webpackConfig.devServer);
  server.listen(port, ip, (err) => {
    if (err) {
      throw new $.util.PluginError('webpack-dev-server', err);
    }
    // Server listening
    $.util.log('[webpack-dev-server]', `http://${ip}:${port}/m-hongbao/`);

    // Chrome is google chrome on OS X, google-chrome on Linux and chrome on Windows.
    // app 在 OS X 中是 google chrome, 在 Windows 为 chrome ,在 Linux 为 google-chrome
    opn(port === 443 ? `https://${ip}/m-hongbao/` : `http://${ip}:${port}/m-hongbao/`, {app: 'google chrome'});
  });

});

gulp.task('webpack:example', () => {
  const {webpackConfig, ip, port} = exampleConfig;
  // Start a webpack-dev-server
  const compiler = webpack(webpackConfig);

  const server = new WebpackDevServer(compiler, webpackConfig.devServer);
  server.listen(port, ip, (err) => {
    if (err) {
      throw new $.util.PluginError('webpack-dev-server', err);
    }
    // Server listening
    $.util.log('[webpack-dev-server:example]', `http://${ip}:${port}/m-hongbao/`);

    // Chrome is google chrome on OS X, google-chrome on Linux and chrome on Windows.
    // app 在 OS X 中是 google chrome, 在 Windows 为 chrome ,在 Linux 为 google-chrome
    opn(port === '80' ? `http://${ip}` : `http://${ip}:${port}/m-hongbao/`, {app: 'google chrome'});
  });

});

// 用webpack 打包编译
gulp.task('webpack:build', () => {
  const compiler = webpack(productionConfig);
  // run webpack
  compiler.run((err, stats) => {
    if (err) {
      throw new $.util.PluginError('webpack:build', err);
    }
    $.util.log('[webpack:build]', stats.toString({
      colors: true
    }));

    gulp.start(['package']);

  });
});

// webpack 插件 DllPlugin
gulp.task('webpack:dll', () => {
  const compiler = webpack(dllConfig);
  // run webpack
  compiler.run((err, stats) => {
    if (err) {
      throw new $.util.PluginError('webpack:dll', err);
    }
    $.util.log('[webpack:dll]', stats.toString({
      colors: true
    }));
  });
});

//开发环境，启动服务
gulp.task('server', ['styles', 'copy:server'], () => {
  gulp.start(['webpack:server']);
  gulp.watch('app/sass/**/*.scss', ['styles']);
  gulp.watch(['app/scripts/config/index.dev.js', 'app/scripts/containers/Root.dev.js', 'app/scripts/store/configureStore.dev.js'], ['copy:server']);
});

//生产环境，启动服务
gulp.task('server:prod', ['styles', 'copy:server:prod'], () => {
  gulp.start(['webpack:server']);
  gulp.watch('app/sass/**/*.scss', ['styles']);
  gulp.watch(['app/scripts/config/index.prod.js', 'app/scripts/containers/Root.prod.js', 'app/scripts/store/configureStore.prod.js'], ['copy:prod']);
});

//打包后,启动服务
gulp.task('connect', () => {
  $.connect.server({
    host: '',
    root: 'dist',
    port: 8001,
    livereload: true
  });
});

//打包后,启动服务
gulp.task('dist', () => {
  const {ip, port} = config;
  $.connect.server({
    root: 'dist',
    host: ip,
    port,
    livereload: true
  });

  gulp.watch('app/sass/**/*.scss', ['styles']);
});

//例子
gulp.task('example', ['styles:example'], () => {
  gulp.start(['webpack:example']);
  gulp.watch('example/sass/**/*.scss', ['styles:example']);
});

//mockjs server
//https://www.npmjs.com/package/gulp-supervisor
gulp.task('mockjs', () => {
  $.supervisor('server/index.js');
});

gulp.task('sass-compress', () => {
  outputStyle = 'compressed';
});

// 编译打包，正式环境
gulp.task('build', ['sass-compress', 'styles', 'copy:prod', 'images-guide', 'images-strategy'], () => {
  gulp.start(['webpack:build']);
});

// 编译打包，测试环境
gulp.task('build:dev', ['sass-compress', 'styles', 'copy:dev', 'images-guide', 'images-strategy'], () => {
  gulp.start(['webpack:build']);
});

// Dll
gulp.task('dll', () => {
  gulp.start(['webpack:dll']);
});

//默认任务
gulp.task('default', () => {
  gulp.start('build');
});
