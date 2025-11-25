<?php
// This file is generated. Do not modify it manually.
return array(
	'thirty-three' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'create-block/thirty-three',
		'version' => '0.1.0',
		'title' => 'thirty Three',
		'category' => 'widgets',
		'icon' => array(
			'src' => 'smiley',
			'background' => '#ccffb3',
			'foreground' => '#007cba'
		),
		'description' => 'Example block scaffolded with Create Block tool.',
		'attributes' => array(
			'imageId' => array(
				'type' => 'number',
				'default' => null
			),
			'imageUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'fileId' => array(
				'type' => 'number',
				'default' => null
			),
			'fileUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'scale' => array(
				'type' => 'number',
				'default' => 0.1
			),
			'rotationX' => array(
				'type' => 'number',
				'default' => 0
			),
			'rotationY' => array(
				'type' => 'number',
				'default' => 0
			),
			'rotationZ' => array(
				'type' => 'number',
				'default' => 0
			),
			'color' => array(
				'type' => 'string',
				'default' => '0x004100'
			)
		),
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'thirty-three',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js'
	)
);
