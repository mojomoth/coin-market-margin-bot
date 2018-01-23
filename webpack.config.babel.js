import path from 'path';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new UglifyJsPlugin({
    //   sourceMap: true,
    // }),
  ],
  resolve: {
    modules: ['node_modules'],
  }
};