const t = require( 'babel-types' );

/**
 * Macro for get/generate uniq reference
 * @function ref
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
 * import { ref } from 'sham-ui-macro/ref.macro';
 *
 * const firstName = ref();
 * const lastName = ref();
 * const state = {
 *     [ firstName ]: 'John',
 *     [ lastName ]: 'Smith'
 * }
 * const fullName = state[ ref( 'firstName' ) ] + state[ ref( 'lastName' ) ];
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
 * @param {BabelPath} callExpressionPath
 * @param {Object} config
 * @param {Object} state
 * @private
 */
module.exports = function ref( callExpressionPath, config, state ) {
    const { uniq = false } = config;

    let name;
    const args = callExpressionPath.node.arguments;
    if ( 0 === args.length  ) {
        const parentPath = callExpressionPath.parentPath;
        if ( !parentPath.isVariableDeclarator() ) {
            throw new Error( 'Pass name to ref' );
        }

        // Use variable as name
        name = parentPath.node.id.name;
    } else {
        name = args[ 0 ].value;
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

    callExpressionPath.replaceWith(
        identifier
    );
};
