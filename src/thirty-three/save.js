import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		imageUrl = '',
		fileUrl = '',
		scale = 0.1,
		rotationX = 0,
		rotationY = 0,
		rotationZ = 0,
		color = '0x004100',
	} = attributes ?? {};

	const blockProps = useBlockProps.save( {
		className: 'thirty-three-block',
		'data-image-url': imageUrl,
		'data-file-url': fileUrl,
		'data-scale': scale,
		'data-rotation-x': rotationX,
		'data-rotation-y': rotationY,
		'data-rotation-z': rotationZ,
		'data-color': color,
	} );

	return (
		<div { ...blockProps }>
			<div className="thirty-three-viewport">
				<div className="thirty-three-placeholder">
					{ imageUrl ? (
						<img src={ imageUrl } alt="" loading="lazy" />
					) : (
						<span>{ '3D preview' }</span>
					) }
					<div className="thirty-three-loader" aria-hidden="true">
						<div className="thirty-three-loader__bar" />
					</div>
				</div>
			</div>
			<div className="thirty-three-status" role="status" aria-live="polite">
				{ fileUrl ? 'Loading 3D model…' : 'No 3MF file selected.' }
			</div>
		</div>
	);
}
