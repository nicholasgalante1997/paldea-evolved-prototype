const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const { EnvironmentPlugin } = webpack;

dotenv.config();

module.exports = {
    entry: path.resolve(process.cwd(), 'src', 'index.ts'),
    mode: 'production',
    module: {
        rules: [
          {
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
          }
        ]
      },
      resolve: {
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
        alias: {
          "@": path.resolve(process.cwd(), "src", "web"),
        }
      },
    output: {
        path: path.resolve(process.cwd(), 'lib'),
        filename: 'index.js'
    },
    target: 'node',
    node: {
        global: false,
    },
    plugins: [new EnvironmentPlugin({ ...process.env })],
};