
import { __, sprintf } from '@wordpress/i18n';
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
	Notice,
	RangeControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { plus, trash } from '@wordpress/icons';

import './editor.scss';

const createEmptyFile = () => ( {
	clientId: `file-${ Date.now().toString( 36 ) }-${ Math.random()
		.toString( 36 )
		.slice( 2 ) }`,
	name: '',
	imageId: null,
	imageUrl: '',
	use3d: false,
	fileId: null,
	fileUrl: '',
	scale: 0.1,
	rotationX: 0,
	rotationY: 0,
	rotationZ: 0,
	color: '0x004100',
} );

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
	const files = Array.isArray( attributes?.files )
		? attributes.files
		: [];

	const setFiles = ( nextFiles ) => setAttributes( { files: nextFiles } );

	const updateFile = ( index, nextValues ) => {
		setFiles(
			files.map( ( file, fileIndex ) => {
				if ( fileIndex !== index ) {
					return file;
				}

				return {
					...file,
					...nextValues,
				};
			} )
		);
	};

	const removeFile = ( index ) => {
		setFiles( files.filter( ( _, fileIndex ) => fileIndex !== index ) );
	};

	const addFile = () => {
		setFiles( [ ...files, createEmptyFile() ] );
	};

	const handleImageSelect = ( index, media ) => {
		updateFile( index, {
			imageId: media?.id ?? null,
			imageUrl: media?.sizes?.medium?.url ?? media?.url ?? '',
		} );
	};

	const handleFileSelect = ( index, media ) => {
		updateFile( index, {
			fileId: media?.id ?? null,
			fileUrl: media?.url ?? '',
		} );
	};

	const fileCards = files.map( ( file, index ) => (
		<Card
			key={ file?.clientId ?? `file-${ index }` }
			className="thirty-three-editor__file-card"
		>
			<CardHeader>
				<Flex align="center" justify="space-between" gap={ 2 }>
					<FlexBlock>
						<strong>
							{ sprintf(
								/* translators: %d is replaced with the row number */
								__( '3MF item %d', 'thirty-three' ),
								index + 1
							) }
						</strong>
						<div className="thirty-three-editor__file-subtitle">
							{ file?.name || __( 'Give this file a name', 'thirty-three' ) }
						</div>
					</FlexBlock>
					<FlexItem>
						<Button
							icon={ trash }
							label={ __( 'Remove item', 'thirty-three' ) }
							variant="tertiary"
							isDestructive
							onClick={ () => removeFile( index ) }
						/>
					</FlexItem>
				</Flex>
			</CardHeader>
			<CardBody>
				<TextControl
					label={ __( 'File name', 'thirty-three' ) }
					value={ file?.name ?? '' }
					onChange={ ( value ) => updateFile( index, { name: value } ) }
					help={ __( 'Shown inside Gutenberg and on the front-end.', 'thirty-three' ) }
				/>

				<div className="thirty-three-editor__media-group">
					<div className="thirty-three-editor__media-input">
						<span className="thirty-three-editor__media-label">
							{ __( 'Preview image', 'thirty-three' ) }
						</span>

						{ file?.imageUrl ? (
							<img
								src={ file.imageUrl }
								alt={ file?.name || __( '3MF preview', 'thirty-three' ) }
								className="thirty-three-editor__image-preview"
							/>
						) : (
							<p className="thirty-three-editor__image-placeholder">
								{ __( 'No image selected', 'thirty-three' ) }
							</p>
						) }

						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) => handleImageSelect( index, media ) }
								value={ file?.imageId ?? undefined }
								allowedTypes={ [ 'image' ] }
								render={ ( { open } ) => (
									<Button variant="secondary" onClick={ open }>
										{ file?.imageId
											? __( 'Change image', 'thirty-three' )
											: __( 'Select image', 'thirty-three' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>

						{ file?.imageId && (
							<Button
								variant="link"
								isDestructive
								onClick={ () =>
									updateFile( index, { imageId: null, imageUrl: '' } )
								}
							>
								{ __( 'Remove image', 'thirty-three' ) }
							</Button>
						) }
					</div>
				</div>

				<ToggleControl
					label={ __( 'Use 3D file', 'thirty-three' ) }
					checked={ !! file?.use3d }
					onChange={ ( value ) => updateFile( index, { use3d: value } ) }
				/>

				{ file?.use3d && (
					<div className="thirty-three-editor__3d-settings">
						<div className="thirty-three-editor__media-input">
							<span className="thirty-three-editor__media-label">
								{ __( '3MF file', 'thirty-three' ) }
							</span>

							{ file?.fileUrl ? (
								<p className="thirty-three-editor__file-path">
									{ file.fileUrl }
								</p>
							) : (
								<p className="thirty-three-editor__image-placeholder">
									{ __( 'No 3MF file selected', 'thirty-three' ) }
								</p>
							) }

							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) => handleFileSelect( index, media ) }
									value={ file?.fileId ?? undefined }
									render={ ( { open } ) => (
										<Button variant="secondary" onClick={ open }>
											{ file?.fileId
												? __( 'Change file', 'thirty-three' )
												: __( 'Select 3MF file', 'thirty-three' ) }
										</Button>
									) }
								/>
							</MediaUploadCheck>

							{ file?.fileId && (
								<Button
									variant="link"
									isDestructive
									onClick={ () =>
										updateFile( index, { fileId: null, fileUrl: '' } )
									}
								>
									{ __( 'Remove file', 'thirty-three' ) }
								</Button>
							) }

							<p className="thirty-three-editor__help-text">
								{ __(
									'Make sure the file only uses lowercase characters without spaces.',
									'thirty-three'
								) }
							</p>
						</div>

						<RangeControl
							label={ __( 'Scale', 'thirty-three' ) }
							value={ Number( file?.scale ?? 0.1 ) }
							onChange={ ( value ) =>
								updateFile( index, { scale: Number( value ?? 0.1 ) } )
							}
							min={ 0.05 }
							max={ 5 }
							step={ 0.05 }
							help={ __( 'Use 0.05 to 5 for fine control.', 'thirty-three' ) }
						/>

						<RangeControl
							label={ __( 'Rotation X (°)', 'thirty-three' ) }
							value={ Number( file?.rotationX ?? 0 ) }
							onChange={ ( value ) =>
								updateFile( index, { rotationX: Number( value ?? 0 ) } )
							}
							min={ -180 }
							max={ 180 }
							step={ 1 }
						/>

						<RangeControl
							label={ __( 'Rotation Y (°)', 'thirty-three' ) }
							value={ Number( file?.rotationY ?? 0 ) }
							onChange={ ( value ) =>
								updateFile( index, { rotationY: Number( value ?? 0 ) } )
							}
							min={ -180 }
							max={ 180 }
							step={ 1 }
						/>

						<RangeControl
							label={ __( 'Rotation Z (°)', 'thirty-three' ) }
							value={ Number( file?.rotationZ ?? 0 ) }
							onChange={ ( value ) =>
								updateFile( index, { rotationZ: Number( value ?? 0 ) } )
							}
							min={ -180 }
							max={ 180 }
							step={ 1 }
						/>

						<div className="thirty-three-editor__color-input">
							<span className="thirty-three-editor__media-label">
								{ __( 'Colour', 'thirty-three' ) }
							</span>
							<ColorPicker
								color={ ensureHexColor( file?.color ) }
								onChangeComplete={ ( color ) => {
									updateFile( index, {
										color: ensure0xColor( color?.hex ?? color ),
									} );
								} }
								disableAlpha
							/>
							<TextControl
								label={ __( 'Hex colour (0x format)', 'thirty-three' ) }
								value={ file?.color ?? '0x004100' }
								onChange={ ( value ) =>
									updateFile( index, { color: ensure0xColor( value ) } )
								}
								help={ __(
									'Example: 0xff0000 for pure red.',
									'thirty-three'
								) }
							/>
						</div>
					</div>
				) }
			</CardBody>
		</Card>
	) );

	return (
		<div { ...useBlockProps( { className: 'thirty-three-editor' } ) }>
			{ files.length === 0 && (
				<Notice status="info" isDismissible={ false }>
					{ __(
						'Add one or more 3MF items to start configuring your 3D showcase.',
						'thirty-three'
					) }
				</Notice>
			) }

			<div className="thirty-three-editor__files">{ fileCards }</div>

			<Button
				variant="primary"
				icon={ plus }
				onClick={ addFile }
				className="thirty-three-editor__add-button"
			>
				{ __( 'Add 3MF item', 'thirty-three' ) }
			</Button>
		</div>
	);
}
