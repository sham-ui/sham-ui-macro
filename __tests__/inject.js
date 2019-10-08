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
        title: '@inject store',
        code: `
            import { inject } from '../babel.macro';

            class FooComponent extends Template {
                @inject store;
            }
        `
    }, {
        title: '@inject(\'sham-ui:store\') store',
        code: `
            import { inject } from '../babel.macro';

            class FooComponent extends Template {
                @inject('sham-ui:store') store
            }
        `
    }, {
        title: 'with imported DI',
        code: `
            import { DI } from 'sham-ui'; 
            import { inject } from '../babel.macro';
            class Service {
                @inject api;
                @inject( 'sham-ui:store' ) uiStore;
            }
        `
    }, {
        title: 'with imported DI as alias',
        code: `
            import { DI as di } from 'sham-ui'; 
            import { inject } from '../babel.macro';
            class Service {
                @inject api;
                @inject( 'sham-ui:store' ) uiStore;
            }
        `
    } ]
} );


