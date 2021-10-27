const t = require( 'babel-types' );

/**
 * Macro for get/generate uniq reference
 * @function $
 * @param {string|Object} [name] Name of reference  or object for processing
 *
 * @example
 * // Config in package.json
 * // "babelMacros": {
 * //   "ref": {
 * //     "enabled": true,
 * //     "uniq": true
 * //   }
 * // }
 *
 * import { $ } from 'sham-ui-macro/ref.macro';
 *
 * const firstName = $();
 * const lastName = $.lastName;
 * const state = {
 *     [ firstName ]: 'John',
 *     [ lastName ]: 'Smith'
 * }
 * const fullName = state[ $( 'firstName' ) ] + state[ $.lastName ];
 * const user = $( { firstName: 'John', lastName: 'Smith' } );
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 *
 * const firstName = 0;
 * const lastName = 1;
 * const state = {
 *     [ firstName ]: 'John',
 *     [ lastName ]: 'Smith'
 * }
 * const fullName = state[ 0 ] + state[ 1 ];
 * const user = { 0: 'John', 1: 'Smith' };
 */

/**
 * @param {BabelPath} expression
 * @param {Object} config
 * @param {Object} state
 * @private
 */
function ref( expression, config, state ) {
    let name;
    if ( expression.isCallExpression() ) {
        const args = expression.node.arguments;
        if ( 1 === args.length && t.isObjectExpression( args[ 0 ] ) ) {
            refObject( expression, config, state );
            return;
        }
        name = getNameFromCallExpression( expression );
    } else if ( expression.isMemberExpression() ) {
        name = getNameFromMemberExpression( expression );
    } else {
        throw new Error( `Unknown usage for ref macro, node.type == '${expression.node.type}'` );
    }
    const identifier = getIdentifier( name, config, state );
    expression.replaceWith(
        identifier
    );
}

/**
 * @param {BabelPath} expression
 * @param {Object} config
 * @param {Object} state
 * @private
 */
function refObject( expression, config, state ) {
    expression.replaceWith(
        t.objectExpression(
            expression.node.arguments[ 0 ].properties.map( prop => {
                if ( prop.computed ) {
                    throw new Error( 'Don\'t allowed object with computed property' );
                }
                if ( !t.isIdentifier( prop.key ) ) {
                    throw new Error(
                        `Property is not Identifier, expected Identifier, receive ${prop.type}`
                    );
                }
                return t.objectProperty(
                    getIdentifier( prop.key.name, config, state ),
                    prop.value
                );
            } )
        )
    );
}

/**
 * Sugar for $ macro. Translate `this$.foo` to analog `this[ $.foo ]`
 * @function this$
 * @param {string} [name] Name of reference
 *
 * @example
 * // Config in package.json
 * // "babelMacros": {
 * //   "ref": {
 * //     "enabled": true,
 * //     "uniq": true
 * //   }
 * // }
 *
 * import { this$ } from 'sham-ui-macro/ref.macro';
 *
 * this$.handleClick = e => { };
 *
 * // ↓ ↓ ↓ ↓ ↓ ↓
 *
 * this[ 0 ] = e => {};
 */

/**
 * @param {BabelPath} expression
 * @param {Object} config
 * @param {Object} state
 * @private
 */
function thisRef( expression, config, state ) {
    const name = getNameFromMemberExpression( expression );
    const identifier = getIdentifier( name, config, state );
    expression.replaceWith(
        t.memberExpression(
            t.thisExpression(),
            identifier,
            true
        )
    );
}


function getNameFromCallExpression( expression ) {
    const args = expression.node.arguments;
    if ( 0 === args.length  ) {
        const parentPath = expression.parentPath;
        if ( !parentPath.isVariableDeclarator() ) {
            throw new Error( 'Pass name to ref' );
        }

        // Use variable as name
        return parentPath.node.id.name;
    }
    return args[ 0 ].value;
}

function getNameFromMemberExpression( expression ) {
    const property = expression.node.property;
    if ( !t.isIdentifier( property ) ) {
        throw new Error(
            `Property is not Identifier, expected Identifier, receive ${expression.node.type}`
        );
    }
    return property.name;
}


function getIdentifier( name, config, state ) {
    const { uniq = false } = config;
    if ( uniq ) {
        if ( !state.map.has( name ) ) {
            state.map.set(
                name,
                state.map.size
            );
        }
        return t.NumericLiteral( state.map.get( name ) );
    }
    return t.StringLiteral( name );
}

module.exports = {
    ref,
    thisRef
};
