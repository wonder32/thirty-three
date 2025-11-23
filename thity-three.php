<?php
/**
 * Plugin Name:       Thirty Three
 * Description:       Working with WordPress Gutenberg and three.js.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      8.0
 * Author:            Wonder32
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       thirty-three
 *
 * @package CreateBlock
 */


if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Load the manifest file for all blocks.
 *
 * @return void
 */

function thirtyThreeInit(): void
{
	if (function_exists('wp_register_block_types_from_metadata_collection')) {
		wp_register_block_types_from_metadata_collection(
			path: __DIR__ . '/build',
			manifest: __DIR__ . '/build/blocks-manifest.php'
		);
	}
}

add_action('init', 'thirtyThreeInit', 20);


/**
 * Make sure translations are loaded for all blocks.
 */

add_action('enqueue_block_editor_assets', 'multiblockRegisterScriptTranslations');
add_action('enqueue_block_assets', 'multiblockRegisterScriptTranslations');

function multiblockRegisterScriptTranslations(): void
{
	$base_path = plugin_dir_path(__FILE__);
	$asset_dirs = glob($base_path . 'build/*', GLOB_ONLYDIR);

	foreach ($asset_dirs as $block_path) {
		$block_name = basename($block_path);

		// Editor script
		$editor_handle = "multiblock-{$block_name}-editor-script";
		if (wp_script_is($editor_handle, 'registered')) {
			wp_set_script_translations($editor_handle, 'multiblock', $base_path . 'languages');
		}

		// View script
		$view_handle = "multiblock-{$block_name}-view-script";
		if (wp_script_is($view_handle, 'registered')) {
			wp_set_script_translations($view_handle, 'multiblock', $base_path . 'languages');
		}
	}
}

add_filter('upload_mimes', 'add3MFUploads');

add_filter('wp_check_filetype_and_ext', 'checkFilterMedia', 10, 4);


function add3MFUploads($mimeTypes): array
{
	$mimeTypes['3mf'] = 'model/3mf';
	// Add the 3MF MIME type.
	return $mimeTypes;
}

/**
 * Add 3MF file type to the allowed file types
 *
 * @return array
 */

function checkFilterMedia(array $types, $file, $filename, $mimes)
{
	if (str_contains($filename, '.3mf') === true) {
		$types['ext'] = '3mf';
		$types['type'] = 'model/3mf';
	}

	return $types;

}//end checkFilterMedia()

