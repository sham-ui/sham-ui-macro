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
        title: 'method',
        code: `
            import { options } from '../babel.macro';

            class FooComponent extends Template {
                @options text() {
                    return this.ID;
                }
            }
        `
    }, {
        title: 'ClassProperty',
        code: `
            import { options } from '../babel.macro';

            class FooComponent extends Template {
                @options text = 'default text';
            }
        `
    }, {
        title: 'ClassProperty (array)',
        code: `
            import { options } from '../babel.macro';

            class FooComponent extends Template {
                @options errors = [ 'errors must be overriden' ];
            }
        `
    }, {
        title: 'getter',
        code: `
            import { options } from '../babel.macro';

            class FooComponent extends Template {
                @options get startDate() {
                    return new Date();
                }
            }
        `
    }, {
        title: 'getter & setter',
        code: `
            import { options } from '../babel.macro';

            class FooComponent extends Template {
                @options get text() {
                    return this._text;
                }
                @options set text( value ) {
                    this._text = value;
                }
                
                @options get date() {
                    return this._date;
                }
                @options set date( value ) {
                    this._date = value;
                }
            }
        `
    }, {
        title: 'already has configureOptions',
        code: `
            import { options } from '../babel.macro';

            class FooComponent extends Template {
                @options get startDate() {
                    return new Date();
                }
                
                configureOptions() {
                    super.configureOptions( ...arguments ); 
                }
            }
        `
    }, {
        title: 'add to existed method',
        code: `
            import { configureOptions } from 'sham-ui';
            import { options } from '../babel.macro';
            
            class FooComponent extends Template {
                @options errors = [ 'errors must be overriden' ];
            
                configureOptions() {
                    super.configureOptions(...arguments);
                    configureOptions(FooComponent.prototype, this, {
                        startDate: {
                            get() {
                                return new Date();
                            }
            
                        }
                    });
                }
            }
        `
    }, {
        title: 'complex (from doc)',
        code: `
            import { options } from '../babel.macro';

            class FooComponent extends Template {
                @options submitText = 'Submit';
                @options loaded = false;
                @options errors = [];
                @options get startDate() {
                    return new Date();
                }
                @options data = {};
                @options onLoad() {};
                
                @options get text() {
                    return this._text;
                }
                @options set text( value ) {
                    this._text = value;
                }
            }
        `
    } ]
} );
