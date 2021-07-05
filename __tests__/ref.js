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
        title: 'without args',
        code: `
            import { $ } from '../ref.macro';

            const foo = $();
        `,
        snapshot: false
    }, {
        title: 'with args',
        code: `
            import { $ } from '../ref.macro';

            const foo = $( 'bar' ) ;
        `
    }, {
        title: 'as key',
        code: `
            import { $ } from '../ref.macro';

            const state = { [ $( 'foo' ) ]: true }; 
        `
    }, {
        title: 'with inject',
        code: `
            import { $ } from '../ref.macro';
            import { inject } from '../inject.macro'

            class FooComponent extends Template {
                @inject store;
            }

            const state = { [ $( 'foo' ) ]: true };
        `
    }, {
        title: 'don\'t used',
        snapshot: false,
        code: `
            import '../ref.macro';
        `
    } ]
} );
