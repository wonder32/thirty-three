require('dotenv').config();

const WEBSITE_URL = process.env.WEBSITE_URL || 'localhost';
const SSL_KEY = process.env.SSL_KEY || '/default.key';
const SSL_CERT = process.env.SSL_CERT || '/default.crt';

const defaultConfigFactory = require('@wordpress/scripts/config/webpack.config');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

// 🔥 Cleanup all PHP files from /build before copying
cleanPhpFilesInBuild(); // Run once before Webpack starts

// We export a function so webpack can pass (env, argv)
module.exports = (env = {}, argv = {}) => {
	// Call the WP default config if it’s a function, otherwise use it directly
	const baseConfig =
		typeof defaultConfigFactory === 'function'
			? defaultConfigFactory(env, argv)
			: defaultConfigFactory;

	// Ensure we work with an array of configs
	const baseConfigs = Array.isArray(baseConfig) ? baseConfig : [baseConfig];

	return baseConfigs.map((config, index) => {
		const isFirst = index === 0;

		return {
			...config,
			plugins: [
				...(config.plugins || []),

				new CopyPlugin({
					patterns: [
						{
							from: path.resolve(__dirname, 'src/**/*.php'),
							to({ context, absoluteFilename }) {
								return path.relative(
									path.resolve(__dirname, 'src'),
									absoluteFilename
								);
							},
							noErrorOnMissing: true,
						},
					],
				}),

				// Only add BrowserSync once (first config)
				...(isFirst
					? [
						new BrowserSyncPlugin(
							{
								proxy: 'https://' + WEBSITE_URL,
								host: WEBSITE_URL,
								port: 3002,
								files: ['**/*.php', '**/*.js', '**/*.css'],
								open: 'external',
								startPath: '/',
								https: {
									key: SSL_KEY,
									cert: SSL_CERT,
								},
								reloadDelay: 0,
								ui: {
									port: 3003,
									host: WEBSITE_URL,
								},
								socket: {
									domain: 'https://' + WEBSITE_URL + ':3002',
								},
							},
							{ reload: true }
						),
					]
					: []),
			],
		};
	});
};

// Helper functions
function cleanPhpFilesInBuild() {
	const files = glob.sync('build/**/*.php');
	files.forEach((file) => {
		fs.unlinkSync(file);
	});
}
