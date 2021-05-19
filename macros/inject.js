const t = require( 'babel-types' );

/**
 * Macro for `DI.resolve`
 * @function inject
 * @param {string} [name] Name of injected item
 *
 * @example
 * import inject from 'sham-ui-macro/inject.macro';
 * class Service {
 *     \@inject api;
 *     \@inject( 'sham-ui:store' ) uiStore;
 * }
 *
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 *
 * class Service {
 *    get api() {
 *        return this.DI.resolve('api');
 *    }
 *
 *    get uiStore() {
 *        return this.DI.resolve('sham-ui:store');
 *    }
 *
 * }
 */

/**
 * @param {BabelPath} decoratorPath
 * @private
 */
module.exports = function inject( decoratorPath ) {
    const parentPath = decoratorPath.parentPath;
    if ( !parentPath.isClassProperty() ) {
        throw new Error( `Only ClassProperty allow, get "${parentPath.node.type}"` );
    }

    let name;
    if ( t.isCallExpression( decoratorPath.node.expression ) ) {
        name = decoratorPath.node.expression.arguments[ 0 ];
    } else {
        name = t.stringLiteral( parentPath.node.key.name );
    }

    parentPath.replaceWith(
        t.classMethod(
            'get',
            parentPath.node.key,
            [],
            t.blockStatement( [
                t.returnStatement(
                    t.callExpression(
                        t.memberExpression(
                            t.memberExpression(
                                t.thisExpression(),
                                t.identifier( 'DI' )
                            ),
                            t.identifier( 'resolve' )
                        ),
                        [ name ]
                    )
                )
            ] )
        )
    );
};
