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

            import { $ } from '../../ref.macro';

            const foo = $();
        `
    }, {
        title: 'with args',
        code: `
            import { $ } from '../../ref.macro';

            const foo = $( 'bar' ) ;
        `
    }, {
        title: 'as key',
        code: `
            import { $ } from '../../ref.macro';

            const state = { [ $( 'foo' ) ]: true };
        `
    }, {
        title: 'as member',
        code: `
            import { $ } from '../../ref.macro';

            const foo = $.bar ;
        `
    }, {
        title: 'member as key',
        code: `
            import { $ } from '../../ref.macro';

            const state = { [ $.foo ]: true };
        `
    }, {
        title: 'cjs without args',
        code: `

            import babel_macro from '../../ref.macro';

            const foo = babel_macro.$();
        `
    }, {
        title: 'cjs with args',
        code: `
            import babel_macro from '../../ref.macro';

            const foo = babel_macro.$( 'bar' ) ;
        `
    }, {
        title: 'cjs as key',
        code: `
            import babel_macro from '../../ref.macro';

            const state = { [ babel_macro.$( 'foo' ) ]: true };
        `
    }, {
        title: 'cjs as member',
        code: `
            import babel_macro from '../../ref.macro';

            const foo = babel_macro.$.bar ;
        `
    }, {
        title: 'cjs member as key',
        code: `
            import babel_macro from '../../ref.macro';

            const state = { [ babel_macro.$.foo ]: true };
        `
    }, {
        title: 'this$ assign',
        code: `
            import { this$ } from '../../ref.macro';

            this$.foo = 1;
        `
    }, {
        title: 'this$ call',
        code: `
            import { this$ } from '../../ref.macro';

            this$.foo( 1 );
        `
    }, {
        title: 'cjs this$ assign',
        code: `
            import babel_macro from '../../ref.macro';

            babel_macro.this$.foo = 1;
        `
    }, {
        title: 'cjs this$ call',
        code: `
            import babel_macro from '../../ref.macro';

            babel_macro.this$.foo( 1 );
        `
    }, {
        title: 'don\'t used',
        code: `
            import '../../ref.macro';
        `
    }, {
        title: '$ & this$',
        code: `
        import { this$, $ } from '../../ref.macro';

        function App( options, update ) {
            const firstGroup = $();
    
            const state = options( {
                [ firstGroup ]: true,
            } );
    
            this$.toggleGroup = () => update( {
                [ firstGroup ]: !state[ firstGroup ]
            } );
        }
        `
    } ]
} );
