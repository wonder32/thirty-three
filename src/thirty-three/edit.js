
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	ColorPicker,
	Flex,
	FlexBlock,
	FlexItem,
	Modal,
	RangeControl,
	TextControl,
} from '@wordpress/components';
import { pencil } from '@wordpress/icons';
import { useEffect, useRef, useState } from '@wordpress/element';

import './editor.scss';

const ensure0xColor = ( value = '' ) => {
	if ( ! value ) {
		return '';
	}

	if ( value.startsWith( '0x' ) ) {
		return value;
	}

	if ( value.startsWith( '#' ) ) {
		return `0x${ value.slice( 1 ) }`;
	}

	return `0x${ value.replace( '#', '' ) }`;
};

const ensureHexColor = ( value = '', fallback = '#004100' ) => {
	if ( ! value ) {
		return fallback;
	}

	if ( value.startsWith( '#' ) ) {
		return value;
	}

	if ( value.startsWith( '0x' ) ) {
		return `#${ value.slice( 2 ) }`;
	}

	return `#${ value }`;
};

export default function Edit( { attributes, setAttributes } ) {
	const {
		imageId,
		imageUrl,
		fileId,
		fileUrl,
		scale,
		rotationX,
		rotationY,
		rotationZ,
		color,
	} = attributes;

	const blockProps = useBlockProps( { className: 'thirty-three-editor' } );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const previewRef = useRef( null );
	const viewerHandleRef = useRef( null );

	const handleImageSelect = ( media ) => {
		setAttributes( {
			imageId: media?.id ?? null,
			imageUrl: media?.sizes?.medium?.url ?? media?.url ?? '',
		} );
	};

	const handleFileSelect = ( media ) => {
		setAttributes( {
			fileId: media?.id ?? null,
			fileUrl: media?.url ?? '',
		} );
	};

	useEffect( () => {
		const root = previewRef.current;
		if ( ! root ) {
			return undefined;
		}

		root.dataset.imageUrl = imageUrl || '';
		root.dataset.fileUrl = fileUrl || '';
		root.dataset.scale = String( Number( scale ?? 1 ) );
		root.dataset.rotationX = String( Number( rotationX ?? 0 ) );
		root.dataset.rotationY = String( Number( rotationY ?? 0 ) );
		root.dataset.rotationZ = String( Number( rotationZ ?? 0 ) );
		root.dataset.color = color || '0x004100';

		const placeholder = root.querySelector( '.thirty-three-placeholder' );
		const status = root.querySelector( '.thirty-three-status' );

		if ( ! fileUrl ) {
			placeholder?.classList.remove( 'is-hidden' );
			if ( status ) {
				status.textContent = __( 'No 3MF file selected.', 'thirty-three' );
			}
			root.querySelector( 'canvas' )?.remove();
			return undefined;
		}

		if ( viewerHandleRef.current?.update ) {
			viewerHandleRef.current.update( {
				scale,
				rotationX,
				rotationY,
				rotationZ,
				color,
			} );
		}

		return undefined;
	}, [ imageUrl, fileUrl, scale, rotationX, rotationY, rotationZ, color ] );

	useEffect( () => {
		const root = previewRef.current;
		if ( ! root ) {
			return undefined;
		}

		if ( ! fileUrl ) {
			viewerHandleRef.current?.destroy?.();
			viewerHandleRef.current = null;
			return undefined;
		}

		let cancelled = false;

		import( './viewer-runtime' )
			.then( ( mod ) => mod.mountViewer( root, { interactive: false, logTransforms: false } ) )
			.then( ( handle ) => {
				if ( cancelled ) {
					handle?.destroy?.();
					return;
				}
				viewerHandleRef.current?.destroy?.();
				viewerHandleRef.current = handle;
				handle?.update?.( {
					scale,
					rotationX,
					rotationY,
					rotationZ,
					color,
				} );
			} )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( '[thirty-three] Preview mount failed', error );
			} );

		return () => {
			cancelled = true;
		};
	}, [ fileUrl ] );

	useEffect(
		() => () => {
			viewerHandleRef.current?.destroy?.();
			viewerHandleRef.current = null;
		},
		[]
	);

	return (
		<div { ...blockProps }>
			<div className="thirty-three-preview">
				<div
					ref={ previewRef }
					className="thirty-three-block"
					data-image-url={ imageUrl || '' }
					data-file-url={ fileUrl || '' }
					data-scale={ scale ?? 1 }
					data-rotation-x={ rotationX ?? 0 }
					data-rotation-y={ rotationY ?? 0 }
					data-rotation-z={ rotationZ ?? 0 }
					data-color={ color || '0x004100' }
				>
					<div className="thirty-three-viewport">
						<div className="thirty-three-placeholder">
							{ imageUrl ? (
								<img src={ imageUrl } alt="" loading="lazy" />
							) : (
								<span>{ __( '3D preview', 'thirty-three' ) }</span>
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
			</div>

			<Card>
				<CardHeader>
					<Flex align="center" justify="space-between" gap={ 2 }>
						<FlexBlock>
							<strong>{ __( '3MF block settings', 'thirty-three' ) }</strong>
							<div className="thirty-three-editor__file-subtitle">
								{ fileUrl
									? fileUrl
									: __( 'No 3MF file selected yet', 'thirty-three' ) }
							</div>
						</FlexBlock>
						<FlexItem>
							<Button
								icon={ pencil }
								variant="secondary"
								className="components-dropdown__toggle"
								onClick={ () => setIsModalOpen( true ) }
							>
								{ __(
									'Edit post selection',
									'dynamic-button-react'
								) }
							</Button>
						</FlexItem>
					</Flex>
				</CardHeader>

				<CardBody>
					<Flex align="center" gap={ 2 }>
						<FlexItem>
							{ imageUrl ? (
								<img
									src={ imageUrl }
									alt={ __( 'Selected preview', 'thirty-three' ) }
									style={ { width: '96px', height: 'auto', borderRadius: '4px' } }
								/>
							) : (
								<div
									style={ {
										width: '96px',
										height: '96px',
										border: '1px dashed #ddd',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: '4px',
										fontSize: '12px',
									} }
								>
									{ __( 'No image', 'thirty-three' ) }
								</div>
							) }
						</FlexItem>
						<FlexBlock>
							<div>
								<strong>{ __( '3MF file', 'thirty-three' ) }:</strong>{ ' ' }
								{ fileUrl || __( 'Not set', 'thirty-three' ) }
							</div>
							<div>
								<strong>{ __( 'Scale', 'thirty-three' ) }:</strong>{ ' ' }
								{ Number( scale ?? 0.1 ).toFixed( 2 ) }
							</div>
							<div>
								<strong>{ __( 'Rotation', 'thirty-three' ) }:</strong>{ ' ' }
								X { Number( rotationX ?? 0 ) }° / Y { Number(
									rotationY ?? 0
								) }° / Z { Number( rotationZ ?? 0 ) }°
							</div>
							<div>
								<strong>{ __( 'Colour', 'thirty-three' ) }:</strong>{ ' ' }
								{ color || '0x004100' }
							</div>
						</FlexBlock>
					</Flex>
				</CardBody>
			</Card>

			{ isModalOpen && (
				<Modal
					title={ __( '3MF settings', 'thirty-three' ) }
					onRequestClose={ () => setIsModalOpen( false ) }
					shouldCloseOnClickOutside={ false }
				>
					<div style={ { display: 'grid', gap: '1rem' } }>
						<div className="thirty-three-editor__media-input">
							<span className="thirty-three-editor__media-label">
								{ __( 'Preview image', 'thirty-three' ) }
							</span>
							{ imageUrl ? (
								<img
									src={ imageUrl }
									alt={ __( '3MF preview', 'thirty-three' ) }
									style={ {
										width: '100%',
										height: 'auto',
										borderRadius: '4px',
										marginBottom: '0.5rem',
									} }
								/>
							) : (
								<p>{ __( 'No image selected', 'thirty-three' ) }</p>
							) }
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ handleImageSelect }
									value={ imageId ?? undefined }
									allowedTypes={ [ 'image' ] }
									render={ ( { open } ) => (
										<Button variant="secondary" onClick={ open }>
											{ imageId
												? __( 'Change image', 'thirty-three' )
												: __( 'Select image', 'thirty-three' ) }
										</Button>
									) }
								/>
							</MediaUploadCheck>
							{ imageId && (
								<Button
									variant="link"
									isDestructive
									onClick={ () =>
										setAttributes( {
											imageId: null,
											imageUrl: '',
										} )
									}
								>
									{ __( 'Remove image', 'thirty-three' ) }
								</Button>
							) }
						</div>

						<div className="thirty-three-editor__media-input">
							<span className="thirty-three-editor__media-label">
								{ __( '3MF file', 'thirty-three' ) }
							</span>
							{ fileUrl ? (
								<p className="thirty-three-editor__file-path">{ fileUrl }</p>
							) : (
								<p>{ __( 'No 3MF file selected', 'thirty-three' ) }</p>
							) }
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ handleFileSelect }
									value={ fileId ?? undefined }
									render={ ( { open } ) => (
										<Button variant="secondary" onClick={ open }>
											{ fileId
												? __( 'Change file', 'thirty-three' )
												: __(
														'Select 3MF file',
														'thirty-three'
												  ) }
										</Button>
									) }
								/>
							</MediaUploadCheck>
							{ fileId && (
								<Button
									variant="link"
									isDestructive
									onClick={ () =>
										setAttributes( { fileId: null, fileUrl: '' } )
									}
								>
									{ __( 'Remove file', 'thirty-three' ) }
								</Button>
							) }
						</div>

						<RangeControl
							label={ __( 'Scale', 'thirty-three' ) }
							value={ Number( scale ?? 0.1 ) }
							onChange={ ( value ) =>
								setAttributes( { scale: Number( value ?? 0.1 ) } )
							}
							min={ 0.01 }
							max={ 5 }
							step={ 0.01 }
							help={ __( 'Use 0.01 to 5 for fine control.', 'thirty-three' ) }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						<RangeControl
							label={ __( 'Rotation X (°)', 'thirty-three' ) }
							value={ Number( rotationX ?? 0 ) }
							onChange={ ( value ) =>
								setAttributes( { rotationX: Number( value ?? 0 ) } )
							}
							min={ -180 }
							max={ 180 }
							step={ 1 }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						<RangeControl
							label={ __( 'Rotation Y (°)', 'thirty-three' ) }
							value={ Number( rotationY ?? 0 ) }
							onChange={ ( value ) =>
								setAttributes( { rotationY: Number( value ?? 0 ) } )
							}
							min={ -180 }
							max={ 180 }
							step={ 1 }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						<RangeControl
							label={ __( 'Rotation Z (°)', 'thirty-three' ) }
							value={ Number( rotationZ ?? 0 ) }
							onChange={ ( value ) =>
								setAttributes( { rotationZ: Number( value ?? 0 ) } )
							}
							min={ -180 }
							max={ 180 }
							step={ 1 }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						<div className="thirty-three-editor__color-input">
							<span className="thirty-three-editor__media-label">
								{ __( 'Colour', 'thirty-three' ) }
							</span>
							<ColorPicker
								color={ ensureHexColor( color ) }
								onChangeComplete={ ( picked ) => {
									setAttributes( {
										color: ensure0xColor( picked?.hex ?? picked ),
									} );
								} }
								disableAlpha
							/>
							<TextControl
								label={ __( 'Hex colour (0x format)', 'thirty-three' ) }
								value={ color ?? '0x004100' }
								onChange={ ( value ) =>
									setAttributes( { color: ensure0xColor( value ) } )
								}
								help={ __(
									'Example: 0xff0000 for pure red.',
									'thirty-three'
								) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</div>

						<Flex justify="flex-end" gap={ 2 }>
							<Button variant="tertiary" onClick={ () => setIsModalOpen( false ) }>
								{ __( 'Close', 'thirty-three' ) }
							</Button>
						</Flex>
					</div>
				</Modal>
			) }
		</div>
	);
}
