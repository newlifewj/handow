
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanDist = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
    entry: [
        './src/index.js'
    ],
    /*
    {
        main: './src/index.js'       // The key of this entry is the [name] of output, default is "main".
        // poly: './polyfills.js'
    },
    */
    mode: 'development',     // The bundle will be minified in 'production' mode
    plugins: [
        new HtmlWebpackPlugin(
            {
                filename: "render.html",  // The target filename will be index.html on default
                template: "./assets/index.html"
            }
        ),
        new CleanDist(),
        new MiniCssExtractPlugin({
            filename: 'main.css'
            // path: '/css/',
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            // filename: "[name].[chunkhash:8].css",
            // chunkFilename: "[id].css"
        })
    ],
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'main.js'
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                // test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                test: /\.(png|jpg|jpeg|gif|bmp)$/,
                loader: require.resolve('url-loader'),
                options: {
                  limit: 100000,
                  name: 'static/media/[name].[hash:8].[ext]'
                }
            },
            {
                test: /\.(js|jsx|mjs)$/,
                // exclude: /(node_modules|bower_components)/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                use: {
                    loader: 'babel-loader',
                    options: { presets: ['react-app'] }     // Only point for React
                }
            },

            {
                test: /\.(css|scss)$/,
                include: [
                    path.resolve(__dirname, "src/views")
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                          modules: true,    // Enable CSS Module process
                          localIdentName: "[name]__[local]___[hash:base64:5]"   // Set localized class name pattern
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },

            {
                test: /\.(css|scss)$/,
                include: [
                    path.resolve(__dirname, "src/scss"),
                    path.resolve(__dirname, "assets/css"),
                    path.resolve(__dirname, "assets/scss")
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },
            {
                test: /\.svg$/,
                loader: require.resolve('file-loader'),
                options: {
                    name: 'assets/images/[name].[hash:8].[ext]'
                }
            }
        ]
    }
};
