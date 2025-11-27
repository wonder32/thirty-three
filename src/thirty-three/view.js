import * as THREE from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';

// eslint-disable-next-line no-console
console.info( '[thirty-three] view.js evaluated' );

const degToRad = ( value = 0 ) =>
	THREE.MathUtils.degToRad( Number.isFinite( value ) ? value : Number( value ) || 0 );

const parseColor = ( value ) => {
	const hex = ( value || '0x004100' ).toString().replace( /^#/, '' ).replace( /^0x/, '' );
	const parsed = parseInt( hex, 16 );
	return Number.isFinite( parsed ) ? parsed : 0x004100;
};

const clamp = ( value, min, max ) => Math.min( Math.max( value, min ), max );

const initViewer = ( root ) => {
	const data = root.dataset || {};
	const viewport = root.querySelector( '.thirty-three-viewport' );
	const placeholder = root.querySelector( '.thirty-three-placeholder' );
	const status = root.querySelector( '.thirty-three-status' );
	const modelUrl = data.fileUrl || '';

	const setStatus = ( text ) => {
		if ( status ) {
			status.textContent = text;
		}
	};

	if ( ! viewport ) {
		return;
	}

	const placeholderImage = data.imageUrl || '';
	const targetScale = clamp( Number( data.scale ) || 0.1, 0.01, 10 );
	const targetRotation = {
		x: degToRad( Number( data.rotationX ) || 0 ),
		y: degToRad( Number( data.rotationY ) || 0 ),
		z: degToRad( Number( data.rotationZ ) || 0 ),
	};
	const targetColor = parseColor( data.color );

	if ( placeholderImage && placeholder?.querySelector( 'img' ) ) {
		placeholder.querySelector( 'img' ).src = placeholderImage;
	}

	if ( ! modelUrl ) {
		setStatus( 'No 3MF file selected.' );
		return;
	}

	const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio || 1 );
	renderer.setSize( viewport.clientWidth, viewport.clientHeight || 320 );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	viewport.appendChild( renderer.domElement );

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x0b1220 );

	const camera = new THREE.PerspectiveCamera(
		50,
		viewport.clientWidth / Math.max( viewport.clientHeight, 1 ),
		0.1,
		5000
	);
	camera.position.set( 0, 0, 30 );

	// Soft, two-point lighting for a modern look.
	scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );
	const keyLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
	keyLight.position.set( 28, 22, 24 );
	keyLight.castShadow = true;
	scene.add( keyLight );

	const rimLight = new THREE.DirectionalLight( 0x7dd3fc, 0.6 );
	rimLight.position.set( -16, -10, -22 );
	scene.add( rimLight );

	let model;
	let pointerDown = false;
	let lastPointer = { x: 0, y: 0 };
	let cameraDistance = 30;

	const manager = new THREE.LoadingManager();
	const loader = new ThreeMFLoader( manager );

	manager.onStart = () => {
		placeholder?.classList.remove( 'is-hidden' );
		setStatus( 'Loading 3D model…' );
	};

	manager.onError = () => {
		setStatus( 'Could not load 3D model.' );
	};

	const centerModel = ( object ) => {
		const aabb = new THREE.Box3().setFromObject( object );
		const center = aabb.getCenter( new THREE.Vector3() );
		object.position.sub( center );

		const size = aabb.getSize( new THREE.Vector3() ).length();
		const fitDistance =
			( size * targetScale ) /
			( 2 * Math.tan( THREE.MathUtils.degToRad( camera.fov * 0.5 ) ) );
		cameraDistance = Math.max( fitDistance * 1.4, 6 );
		camera.position.set( 0, 0, cameraDistance );
		camera.lookAt( 0, 0, 0 );
	};

	const applyLook = ( object ) => {
		object.scale.setScalar( targetScale );
		object.rotation.set( targetRotation.x, targetRotation.y, targetRotation.z );
		object.traverse( ( child ) => {
			if ( child.isMesh ) {
				child.castShadow = true;
				child.receiveShadow = true;
				child.material = child.material.clone();
				child.material.color = new THREE.Color( targetColor );
			}
		} );
	};

	const loadModel = () => {
		if ( ! modelUrl ) {
			setStatus( 'No 3MF file selected.' );
			return;
		}

		loader.load(
			modelUrl,
			( group ) => {
				setStatus( '3D model ready' );
				placeholder?.classList.add( 'is-hidden' );

				if ( model ) {
					scene.remove( model );
				}
				model = group;
				applyLook( model );
				centerModel( model );
				scene.add( model );
				render();
			},
			undefined,
			( error ) => {
				setStatus( 'Could not load 3D model.' );
				placeholder?.classList.remove( 'is-hidden' );
			}
		);
	};

	const onPointerDown = ( event ) => {
		pointerDown = true;
		lastPointer = { x: event.clientX, y: event.clientY };
	};

	const onPointerUp = () => {
		pointerDown = false;
	};

	const onPointerMove = ( event ) => {
		if ( ! pointerDown || ! model ) {
			return;
		}
		const deltaX = event.clientX - lastPointer.x;
		const deltaY = event.clientY - lastPointer.y;
		model.rotation.y += deltaX * 0.01;
		model.rotation.x += deltaY * 0.01;
		lastPointer = { x: event.clientX, y: event.clientY };
		render();
	};

	const onWheel = ( event ) => {
		if ( ! model ) {
			return;
		}
		event.preventDefault();
		const direction = event.deltaY > 0 ? 1 : -1;
		cameraDistance *= direction > 0 ? 1.08 : 0.92;
		cameraDistance = clamp( cameraDistance, 4, 200 );
		camera.position.set( 0, 0, cameraDistance );
		render();
	};

	const onResize = () => {
		const width = viewport.clientWidth || 1;
		const height = viewport.clientHeight || 1;
		renderer.setSize( width, height );
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		render();
	};

	viewport.addEventListener( 'pointerdown', onPointerDown );
	window.addEventListener( 'pointerup', onPointerUp );
	window.addEventListener( 'pointermove', onPointerMove );
	viewport.addEventListener( 'wheel', onWheel, { passive: false } );
	window.addEventListener( 'resize', onResize );

	const render = () => {
		renderer.render( scene, camera );
	};

	renderer.setAnimationLoop( render );
	loadModel();
	onResize();
};

window.addEventListener( 'DOMContentLoaded', () => {
	document
		.querySelectorAll( '.wp-block-create-block-thirty-three, .thirty-three-block' )
		.forEach( initViewer );
} );