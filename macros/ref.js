const t = require( 'babel-types' );

/**
 * Macro for get/generate uniq reference
 * @function $
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
 * import { $ } from 'sham-ui-macro/ref.macro';
 *
 * const firstName = $();
 * const lastName = $.lastName;
 * const state = {
 *     [ firstName ]: 'John',
 *     [ lastName ]: 'Smith'
 * }
 * const fullName = state[ $( 'firstName' ) ] + state[ $.lastName ];
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
 */

/**
 * @param {BabelPath} expression
 * @param {Object} config
 * @param {Object} state
 * @private
 */
function ref( expression, config, state ) {
    const { uniq = false } = config;

    let name;
    if ( expression.isCallExpression() ) {
        name = getNameFromCallExpression( expression );
    } else if ( expression.isMemberExpression() ) {
        name = getNameFromMemberExpression( expression );
    } else {
        throw new Error( `Unknown usage for ref macro, node.type == '${expression.node.type}'` );
    }

    let identifier;
    if ( uniq ) {
        if ( !state.map.has( name ) ) {
            state.map.set(
                name,
                state.map.size
            );
        }
        identifier = t.NumericLiteral( state.map.get( name ) );
    } else {
        identifier = t.StringLiteral( name );
    }

    expression.replaceWith(
        identifier
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
function thisRef( expression, config, state ) {
    const { uniq = false } = config;

    const name = getNameFromMemberExpression( expression );

    let identifier;
    if ( uniq ) {
        if ( !state.map.has( name ) ) {
            state.map.set(
                name,
                state.map.size
            );
        }
        identifier = t.NumericLiteral( state.map.get( name ) );
    } else {
        identifier = t.StringLiteral( name );
    }

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


module.exports = {
    ref,
    thisRef
};
