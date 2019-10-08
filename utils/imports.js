/* eslint-env node */
'use strict';

const t = require( 'babel-types' );

module.exports = class Imports {
    constructor( anyPath ) {
        this._findProgramPath( anyPath );
        this._collectImports();
    }

    _findProgramPath( path ) {
        this.root = path.findParent( path => path.isProgram() );
    }

    _collectImports() {
        this.importPath = null;
        this.imports = new Map();
        this.root
            .get( 'body' )
            .forEach( p => {
                if ( p.isImportDeclaration() && p.node.source.value === 'sham-ui' ) {
                    this.importPath = p;
                    p.node.specifiers.forEach(
                        sp => this.imports.set( sp.imported.name, sp.local.name )
                    );
                }
            } );
    }

    addImport( name ) {
        if ( this.imports.has( name ) ) {
            return this.imports.get( name );
        }
        const specifier = t.importSpecifier( t.identifier( name ), t.identifier( name ) );
        if ( null === this.importPath ) {
            const node = t.importDeclaration(
                [ specifier ],
                t.stringLiteral( 'sham-ui' )
            );
            this.root.unshiftContainer( 'body', node );
            this.importPath = node;
        } else {
            this.importPath.get( 'specifiers' ).pushContainer( 'specifiers', specifier );
        }
        this.imports.set( name, name );
        return name;
    }
};
