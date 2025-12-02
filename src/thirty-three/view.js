import { mountViewer } from './viewer-runtime';

// eslint-disable-next-line no-console
console.info( '[thirty-three] view.js evaluated' );

const bootViewers = () => {
	document
		.querySelectorAll( '.wp-block-create-block-thirty-three, .thirty-three-block' )
		.forEach( ( root ) => {
			mountViewer( root ).catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( '[thirty-three] Failed to mount viewer', error );
			} );
		} );
};

if ( document.readyState === 'loading' ) {
	window.addEventListener( 'DOMContentLoaded', bootViewers );
} else {
	bootViewers();
}
