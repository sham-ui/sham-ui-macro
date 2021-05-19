/* eslint-env node */

const path = require( 'path' );
const pluginTester = require( 'babel-plugin-tester' );
const plugin = require( 'babel-plugin-macros' );

const projectRoot = path.join( __dirname, '../../../' );

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
        title: 'without args',
        code: `
           
            import ref from '../../ref.macro';

            const foo = ref();
        `
    }, {
        title: 'with args',
        code: `
            import ref from '../../ref.macro';

            const foo = ref( 'bar' ) ;
        `
    }, {
        title: 'as key',
        code: `
            import ref from '../../ref.macro';

            const state = { [ ref( 'foo' ) ]: true }; 
        `
    } ]
} );