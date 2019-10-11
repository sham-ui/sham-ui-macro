/* eslint-env node */

const path = require( 'path' );
const pluginTester = require( 'babel-plugin-tester' );
const plugin = require( 'babel-plugin-macros' );

const projectRoot = path.join( __dirname, '../../' );

expect.addSnapshotSerializer( {
    print( val ) {
        return val.split( projectRoot ).join( '<PROJECT_ROOT>/' );
    },
    test( val ) {
        return typeof val === 'string';
    }
} );

pluginTester( {
    plugin,
    snapshot: true,
    babelOptions: {
        filename: __filename,
        parserOpts: {
            plugins: [
                'decorators',
                'classProperties'
            ]
        }
    },
    tests: [ {
        title: 'mergeWithTemplate',
        code: `
            import { mergeWithTemplate } from '../babel.macro';

            class Template extends __UI__.Component {
                constructor( options ) {
                    super( options );
            
                    // Create elements
                    const div0 = document.createElement( 'div' );
                    const text1 = document.createTextNode( '' );
            
                    // Construct dom
                    div0.appendChild( document.createTextNode( " Content " ) );
                    div0.appendChild( text1 );
            
                    // Update functions
                    this.__update__ = {
                        text( text ) {
                            text1.textContent = text;
                        }
                    };
            
                    // Set root nodes
                    this.nodes = [ div0 ];
                }
            
                updateSpots( __data__ ) {
                    if ( __data__.text !== undefined ) {
                        this.__update__.text( __data__.text );
                    }
                }
            }
            
            @mergeWithTemplate
            class dummy extends Template {
                @options text = 'default text';
                @options get startDate() {
                    return new Date();
                }
        
                constructor() {
                    super( ...arguments );
                    console.log( 'constructor called' ); 
                }
        
                updateSpots() {
                    console.log( 'before update spots' ); 
                    super.updateSpots(  ...arguments );
                    console.log( 'spots updated' );
                }
            }
        `
    }, {
        title: 'mergeWithTemplate, options & inject',
        code: `
            import { mergeWithTemplate, options, inject } from '../babel.macro';

            class Template extends __UI__.Component {
                constructor( options ) {
                    super( options );
            
                    // Create elements
                    const div0 = document.createElement( 'div' );
                    const text1 = document.createTextNode( '' );
            
                    // Construct dom
                    div0.appendChild( document.createTextNode( " Content " ) );
                    div0.appendChild( text1 );
            
                    // Update functions
                    this.__update__ = {
                        text( text ) {
                            text1.textContent = text;
                        }
                    };
            
                    // Set root nodes
                    this.nodes = [ div0 ];
                }
            
                updateSpots( __data__ ) {
                    if ( __data__.text !== undefined ) {
                        this.__update__.text( __data__.text );
                    }
                }
            }
            
            @mergeWithTemplate
            class dummy extends Template {
                @inject logger;
            
                @options text = 'default text';
                @options get startDate() {
                    return new Date();
                }
        
                constructor() {
                    super( ...arguments );
                    this.logger.log( 'constructor called' ); 
                }
        
                updateSpots() {
                    this.logger.log( 'before update spots' ); 
                    super.updateSpots(  ...arguments );
                    this.logger.log( 'spots updated' );
                }
            }
        `
    } ]
} );


