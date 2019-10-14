/**
 * @private
 * @type {Object}
 */
module.exports = {

    /**
     * @inner
     * @param {BabelPath} classBodyPath
     * @return {BabelPath|undefined}
     */
    findConfigureOptionsMethod( classBodyPath ) {
        return classBodyPath
            .get( 'body' )
            .find(
                p => p.isClassMethod() &&
                p.get( 'key' ).isIdentifier() &&
                p.node.key.name === 'configureOptions'
            );
    },

    /**
     * @inner
     * @param {BabelPath} configureOptionsMethodPath
     * @param {string} configureOptionsName
     * @return {BabelPath|undefined}
     */
    findConfigureObject( configureOptionsMethodPath, configureOptionsName ) {
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
};
