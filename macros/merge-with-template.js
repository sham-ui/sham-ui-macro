const t = require( 'babel-types' );

/**
 * Merge component class with template class.
 * @function mergeWithTemplate
 *
 * @example
 * import { mergeWithTemplate } from 'sham-ui-macro/babel.macro';
 *
 * class Template extends __UI__.Component {
 *     constructor( options ) {
 *         super( options );
 *
 *         // Create elements
 *         const div0 = document.createElement( 'div' );
 *         const text1 = document.createTextNode( '' );
 *
 *         // Construct dom
 *         div0.appendChild( document.createTextNode( " Content " ) );
 *         div0.appendChild( text1 );
 *
 *         // Update functions
 *         this.__update__ = {
 *             text( text ) {
 *                 text1.textContent = text;
 *             }
 *         };
 *
 *         // Set root nodes
 *         this.nodes = [ div0 ];
 *     }
 *
 *     updateSpots( __data__ ) {
 *         if ( __data__.text !== undefined ) {
 *             this.__update__.text( __data__.text );
 *         }
 *     }
 * }
 *
 * \@mergeWithTemplate
 * class dummy extends Template {
 *     \@options text = 'default text';
 *     \@options get startDate() {
 *         return new Date();
 *     }
 *
 *     constructor() {
 *         super( ...arguments );
 *         console.log( 'constructor called' );
 *     }
 *
 *     updateSpots() {
 *         console.log( 'before update spots' );
 *         super.updateSpots(  ...arguments );
 *         console.log( 'spots updated' );
 *     }
 * }
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 *
 * class dummy extends __UI__.Component {
 *     \@options text = 'default text';
 *
 *     constructor( options ) {
 *         super(options);
 *
 *         // Create elements
 *         const div0 = document.createElement( 'div' );
 *         const text1 = document.createTextNode( '' );
 *
 *         // Construct dom
 *         div0.appendChild( document.createTextNode( " Content " ) );
 *         div0.appendChild( text1 );
 *
 *         // Update functions
 *         this.__update__ = {
 *             text( text ) {
 *                 text1.textContent = text;
 *             }
 *         };
 *
 *         // Set root nodes
 *         this.nodes = [ div0 ];
 *
 *         console.log( 'constructor called' );
 *     }
 *
 *     updateSpots( __data__ ) {
 *         console.log( 'before update spots' );
 *
 *         if ( __data__.text !== undefined ) {
 *             this.__update__.text( __data__.text );
 *         }
 *
 *         console.log( 'spots updated' );
 *     }
 *
 *     \@options get startDate() {
 *         return new Date();
 *     }
 * }
 */

/**
 * @param {BabelPath} decoratorPath
 * @private
 */
module.exports = function mergeWithTemplate( decoratorPath ) {
    const classDeclaration = decoratorPath.parentPath;
    if ( !classDeclaration.isClassDeclaration() ) {
        throw new Error( `Only ClassDeclaration allow, get "${classDeclaration.node.type}"` );
    }

    if ( !classDeclaration.parentPath.isProgram() ) {
        throw new Error( `Parent path of ClassDeclaration must be Program, get "${classDeclaration.parentPath.node.type}"` );
    }

    const superClass = findSuperClass( classDeclaration );
    if ( !superClass ) {
        throw new Error( `Can't find ClassDeclaration for ${classDeclaration.get( 'superClass' ).node.name}` );
    }

    superClass.get( 'id' ).replaceWith(
        classDeclaration.node.id
    );

    const methods = buildMappingForBodyMethods( superClass );
    classDeclaration
        .get( 'body' )
        .traverse( {
            ClassProperty( p ) {
                superClass.get( 'body' ).unshiftContainer( 'body', p.node );
            },
            ClassMethod( p ) {
                if ( p.get( 'key' ).isIdentifier() && methods.has( p.node.key.name ) ) {
                    mergeMethods(
                        p.node,
                        methods.get( p.node.key.name )
                    );
                } else {
                    superClass.get( 'body' ).pushContainer( 'body', p.node );
                }
            }
        } );

    classDeclaration.remove();
};

/**
 * @private
 * @param {BabelPath} classDeclarationPath
 * @return {BabelPath}
 */
function findSuperClass( classDeclarationPath ) {
    const superClassName = classDeclarationPath.get( 'superClass' ).node.name;
    return classDeclarationPath
        .parentPath
        .get( 'body' )
        .find(
            p => p.isClassDeclaration() &&
            p.get( 'id' ).isIdentifier() &&
            p.node.id.name === superClassName
        );
}

/**
 * @private
 * @param {BabelPath} classDeclarationPath
 * @return {Map<string,BabelPath>}
 */
function buildMappingForBodyMethods( classDeclarationPath ) {
    const methods = new Map();
    classDeclarationPath
        .get( 'body' )
        .get( 'body' )
        .forEach( p => {
            if ( p.isClassMethod() && p.get( 'key' ).isIdentifier() ) {
                methods.set( p.node.key.name, p );
            }
        } );
    return methods;
}

/**
 * @private
 * @param {ClassMethod} methodNode
 * @param {BabelPath} superMethodPath
 */
function mergeMethods( methodNode, superMethodPath ) {
    const superMethodBody = superMethodPath.get( 'body' );
    let superCalled = false;
    methodNode.body.body.forEach( x => {
        if ( isSuper( x ) ) {
            superCalled = true;
        } else {
            superMethodBody[ superCalled ? 'pushContainer' : 'unshiftContainer' ](
                'body',
                x
            );
        }
    } );
}

/**
 * @private
 * @param {*} node
 * @return {boolean}
 */
function isSuper( node ) {
    return t.isExpressionStatement( node ) &&
        t.isCallExpression( node.expression ) &&
        (
            (
                t.isMemberExpression( node.expression.callee ) &&
                t.isSuper( node.expression.callee.object )
            ) || (
                t.isSuper( node.expression.callee )
            )
        );
}
