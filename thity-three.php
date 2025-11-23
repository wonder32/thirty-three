<?php
/**
 * Plugin Name:       Thirty Three
 * Description:       Working with WordPress Gutenberg and three.js.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Wonder32
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       thirty-three
 *
 * @package CreateBlock
 */


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Load the manifest file for all blocks.
 *
 * @return void
 */

function multiBlockInit()
{
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection(
			path: __DIR__ . '/build',
			manifest: __DIR__ . '/build/blocks-manifest.php'
		);
	}
}
add_action( 'init', 'multiBlockInit', 20 );


/**
 * Make sure translations are loaded for all blocks.
 */

add_action( 'enqueue_block_editor_assets', 'multiblock_register_script_translations' );
add_action( 'enqueue_block_assets', 'multiblock_register_script_translations' );

function multiblock_register_script_translations() {
	$base_path  = plugin_dir_path( __FILE__ );
	$asset_dirs = glob( $base_path . 'build/*', GLOB_ONLYDIR );

	foreach ( $asset_dirs as $block_path ) {
		$block_name = basename( $block_path );

		// Editor script
		$editor_handle = "multiblock-{$block_name}-editor-script";
		if ( wp_script_is( $editor_handle, 'registered' ) ) {
			wp_set_script_translations( $editor_handle, 'multiblock', $base_path . 'languages' );
		}

		// View script
		$view_handle = "multiblock-{$block_name}-view-script";
		if ( wp_script_is( $view_handle, 'registered' ) ) {
			wp_set_script_translations( $view_handle, 'multiblock', $base_path . 'languages' );
		}
	}
}
