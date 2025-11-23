
import { __, _x } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

import './editor.scss';

export default function Edit() {
	return (
		<p { ...useBlockProps() }>
			{ __( 'thirty Three – hello from the editor!', 'thirty-three' ) }
		</p>
	);
}
