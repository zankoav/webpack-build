const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AssetsPlugin = require("assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const autoprefixer = require('autoprefixer');

function getPrefix(env) {
    const LANG = env.lang || 'pl';
    const DOMAINS = {
        pl: "/resource/qwerty1234567/source/",
        de: "/resource/qwerty2345678/source/",
        ru: "/resource/qwerty3456789/source/"
    };
    return DOMAINS[LANG];
}

module.exports = env => {
    const IS_DEV = env.mode === 'development';
    const publicPath = IS_DEV ? '/' : 'src';
    const productionPrefix = getPrefix(env) || publicPath;
    const plugins = [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: IS_DEV ? "css/[name].css" : "css/[name].[hash:6].min.css",
            disable: false,
            allChunks: false
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            title: "Index page",
            template: './frontend/index.pug'
        })
    ];
    const output = {
        filename: IS_DEV ? 'js/[name].js' : 'js/[name].[hash:6].min.js',
        publicPath: publicPath
    }

    if (!IS_DEV) {
        plugins.push(new AssetsPlugin({
            path: publicPath,
            filename: 'assets.json',
            prettyPrint: IS_DEV,
            processOutput: function (assets) {
                console.log('assets', assets);
                return JSON.stringify(assets)
            }
        }));
        output.path = path.resolve(__dirname, publicPath);
        output.publicPath = productionPrefix;
    }

    const config = {
        optimization: {
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        },
        mode: env.mode || 'development',
        entry: {
            index: './frontend/index.js'
        },
        output: output,
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    exclude: /(node_modules)/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [autoprefixer]
                            }
                        },
                        {
                            loader: 'resolve-url-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.pug$/,
                    loader: "pug-loader",
                    options: {
                        pretty: IS_DEV
                    }
                },
                {
                    test: /\.(jpg|png|svg|gif)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: IS_DEV ? 'icons/[name].[ext]' : 'icons/[name].[hash:6].[ext]',
                                publicPath: IS_DEV ? publicPath : productionPrefix
                            }
                        }
                    ]
                },
                // Fonts Loader
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'fonts/[name].[hash:6].[ext]',
                                publicPath: IS_DEV ? publicPath : productionPrefix
                            }
                        }
                    ]
                },
            ]
        }, devServer: {
            overlay: true,
            contentBase: publicPath
        },
        plugins: plugins
    }

    return config;
};