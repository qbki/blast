const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

function root(...args) {
  return path.resolve(__dirname, ...args);
}

module.exports = {
  entry: './src/index.ts',
  output: {
    path: root('dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'babel-loader',
          'ts-loader'
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  devServer: {
    contentBase: root('assets'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: root('src/index.html'),
      hash: true,
    }),
    new CopyWebpackPlugin([
      { from: 'src/index.html', to: 'index.html', toType: 'file' },
      { from: 'assets/images', to: 'images', toType: 'dir' },
    ]),
  ],
};
