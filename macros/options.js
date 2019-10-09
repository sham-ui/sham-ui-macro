const t = require( 'babel-types' );
const Imports = require( '../utils/imports' );

/**
 * Macro for sham-ui `@options`. Replace decorator with `configureOptions` method
 * @function options
 *
 * @example
 * import { options } from 'sham-ui-macro/babel.macro';
 * class FooComponent extends Template {
 *     \@options submitText = 'Submit';
 *     \@options loaded = false;
 *     \@options errors = [];
 *     \@options get startDate() {
 *         return new Date();
 *     }
 *     \@options data = {};
 *     \@options onLoad() {};
 *
 *     \@options get text() {
 *         return this._text;
 *     }
 *     \@options set text( value ) {
 *         this._text = value;
 *     }
 * }
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 *
 * import { configureOptions } from 'sham-ui';
 * class FooComponent extends Template {
 *     configureOptions() {
 *         super.configureOptions( ...arguments );
 *         configureOptions( FooComponent.prototype, this, {
 *             submitText: 'Submit',
 *             loaded: false,
 *             errors: [],
 *             startDate: {
 *                 get() {
 *                     return new Date();
 *                 }
 *             },
 *             data: {},
 *             onLoad() {},
 *             text: {
 *                 get() {
 *                     return this._text;
 *                 },
 *                 set( value ) {
 *                     this._text = value;
 *                 }
 *             }
 *        } );
 *    }
 * }
 */

/**
 * @param {BabelPath} decoratorPath
 * @private
 */
module.exports = function options( decoratorPath ) {
    const parentPath = decoratorPath.parentPath;

    const imports = new Imports( parentPath );
    const configureOptionsName = imports.addImport( 'configureOptions' );

    const classBody = parentPath.findParent( path => path.isClassBody() );
    const className = classBody.parentPath.node.id;

    const configureOptionsMethod = getOrCreate(
        () => findConfigureOptionsMethod( classBody ),
        () => classBody.unshiftContainer(
            'body',
            buildConfigureOptionsMethod( configureOptionsName, className )
        )
    );

    const optionsObject = getOrCreate(
        () => findConfigureObject( configureOptionsMethod, configureOptionsName ),
        () => configureOptionsMethod.get( 'body' ).pushContainer(
            'body',
            buildConfigureOptionsExpression( configureOptionsName, className )
        )
    );

    if ( parentPath.isClassProperty() ) {
        processProperty( optionsObject, parentPath.node );
    } else if ( parentPath.isClassMethod() ) {
        const method = parentPath.node;
        if ( method.kind === 'method' ) {
            processMethod( optionsObject, method );
        } else {
            if ( !t.isIdentifier( method.key ) ) {
                throw new Error(
                    `Only Identifier allowed for @options ClassMethod key, get "${method.key.type}"`
                );
            }
            processGetterOrSetter( optionsObject, method );
        }
    } else {
        throw new Error(
            `Decorator @options allowed only for ClassMethod or ClassProperty, get "${parentPath.node.type}"`
        );
    }

    parentPath.remove();
};

/**
 * @private
 * @param {Function} getCallback
 * @param {Function} createCallback
 * @return {*}
 */
function getOrCreate( getCallback, createCallback ) {
    const path = getCallback();
    if ( !path ) {
        createCallback();
        return getCallback();
    }
    return path;
}

/**
 * @private
 * @param {BabelPath} classBodyPath
 * @return {BabelPath|undefined}
 */
function findConfigureOptionsMethod( classBodyPath ) {
    return classBodyPath
        .get( 'body' )
        .find(
            p => p.isClassMethod() &&
            p.get( 'key' ).isIdentifier() &&
            p.node.key.name === 'configureOptions'
        );
}

/**
 * @private
 * @param {string} configureOptionsName
 * @param {string} className
 * @return {ClassMethod}
 */
function buildConfigureOptionsMethod( configureOptionsName, className ) {
    return t.classMethod(
        'method',
        t.identifier( 'configureOptions' ),
        [],
        t.blockStatement( [
            t.expressionStatement(
                t.callExpression(
                    t.memberExpression(
                        t.super(),
                        t.identifier( 'configureOptions' )
                    ),
                    [ t.spreadElement( t.identifier( 'arguments' ) ) ]
                )
            ),
            buildConfigureOptionsExpression( configureOptionsName, className )
        ] )
    );
}

/**
 * @private
 * @param {BabelPath} configureOptionsMethodPath
 * @param {string} configureOptionsName
 * @return {BabelPath|undefined}
 */
function findConfigureObject( configureOptionsMethodPath, configureOptionsName ) {
    let configureObject;
    configureOptionsMethodPath.traverse( {
        ObjectExpression( path ) {
            if ( !path.parentPath.isCallExpression() ) {
                return;
            }
            if ( !path.parentPath.get( 'callee' ).isIdentifier() ) {
                return;
            }
            if ( path.parentPath.get( 'callee' ).node.name === configureOptionsName ) {
                configureObject = path;
                path.stop();
            }
        }
    } );
    return configureObject;
}

/**
 * @private
 * @param {string} configureOptionsName
 * @param {string} className
 * @return {ExpressionStatement}
 */
function buildConfigureOptionsExpression( configureOptionsName, className ) {
    return t.expressionStatement(
        t.callExpression(
            t.identifier( configureOptionsName ),
            [
                t.memberExpression(
                    className,
                    t.identifier( 'prototype' )
                ),
                t.thisExpression(),
                t.objectExpression( [] )
            ]
        )
    );
}

/**
 * @private
 * @param {BabelPath} optionsObject
 * @param {ClassProperty} prop
 */
function processProperty( optionsObject, prop ) {
    const node = t.objectProperty(
        prop.key,
        prop.value,
        prop.computed
    );
    optionsObject.pushContainer( 'properties', node );
}

/**
 * @private
 * @param {BabelPath} optionsObject
 * @param {ClassMethod} method
 */
function processMethod( optionsObject, method ) {
    const node = t.objectMethod(
        'method',
        method.key,
        method.params,
        method.body,
        method.computed
    );
    optionsObject.pushContainer( 'properties', node );
}

/**
 * @private
 * @param {BabelPath} optionsObject
 * @param {ClassMethod} method
 */
function processGetterOrSetter( optionsObject, method ) {
    const optionsName = method.key.name;
    const opt = getOrCreate(
        () => findObjectProperty( optionsObject, optionsName ),
        () => optionsObject.pushContainer(
            'properties',
            t.objectProperty(
                method.key,
                t.objectExpression( [] ),
                method.computed
            )
        )
    );
    const node = t.objectMethod(
        'method',
        t.identifier( method.kind ),
        method.params,
        method.body,
        method.computed
    );
    opt.get( 'value' ). pushContainer( 'properties', node );
}

/**
 * @private
 * @param {BabelPath} optionsObject
 * @param {string} name
 * @return {BabelPath|undefined}
 */
function findObjectProperty( optionsObject, name ) {
    return optionsObject.get( 'properties' ).find(
        p => p.isObjectProperty() &&
        p.get( 'key' ).isIdentifier() &&
        p.node.key.name === name
    );
}
