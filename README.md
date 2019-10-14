# sham-ui-macro

[![Build Status](https://travis-ci.org/sham-ui/sham-ui-macro.svg?branch=master)](https://travis-ci.org/sham-ui/sham-ui-macro)
[![npm version](https://badge.fury.io/js/sham-ui-macro.svg)](https://badge.fury.io/js/sham-ui-macro)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

Babel macros for `sham-ui`.

### Install

Install from yarn:
`yadn add sham-ui-macro --dev`

And add `babel-macros` plugin to your babel config. 

### API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

##### Table of Contents

-   [inject](#inject)
    -   [Parameters](#parameters)
    -   [Examples](#examples)
-   [options](#options)
    -   [Examples](#examples-1)
-   [mergeWithTemplate](#mergewithtemplate)
    -   [Examples](#examples-2)

#### inject

Macro for `DI.resolve`

##### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Name of injected item

##### Examples

```javascript
import { inject } from 'sham-ui-macro/babel.macro';
class Service {
    @inject api;
    @inject( 'sham-ui:store' ) uiStore;
}


// ↓ ↓ ↓ ↓ ↓ ↓

import { DI } from 'sham-ui';

class Service {
   get api() {
       return DI.resolve('api');
   }

   get uiStore() {
       return DI.resolve('sham-ui:store');
   }

}
```

#### options

Macro for sham-ui `@options`. Replace decorator with `configureOptions` method

##### Examples

```javascript
import { options } from 'sham-ui-macro/babel.macro';
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

// ↓ ↓ ↓ ↓ ↓ ↓

import { configureOptions } from 'sham-ui';
class FooComponent extends Template {
    configureOptions() {
        super.configureOptions( ...arguments );
        configureOptions( FooComponent.prototype, this, {
            submitText: 'Submit',
            loaded: false,
            errors: [],
            startDate: {
                get() {
                    return new Date();
                }
            },
            data: {},
            onLoad() {},
            text: {
                get() {
                    return this._text;
                },
                set( value ) {
                    this._text = value;
                }
            }
       } );
   }
}
```

#### mergeWithTemplate

Merge component class with template class.

##### Examples

```javascript
import { mergeWithTemplate } from 'sham-ui-macro/babel.macro';

class Template extends __UI__.Component {
    constructor( options ) {
        super( options );

        // Create elements
        const div0 = document.createElement( 'div' );
        const text1 = document.createTextNode( '' );

        // Construct dom
        div0.appendChild( document.createTextNode( " Content " ) );
        div0.appendChild( text1 );

        // Update functions
        this.__update__ = {
            text( text ) {
                text1.textContent = text;
            }
        };

        // Set root nodes
        this.nodes = [ div0 ];
    }

    updateSpots( __data__ ) {
        if ( __data__.text !== undefined ) {
            this.__update__.text( __data__.text );
        }
    }
}

@mergeWithTemplate
class dummy extends Template {
    @options text = 'default text';
    @options get startDate() {
        return new Date();
    }

    constructor() {
        super( ...arguments );
        console.log( 'constructor called' );
    }

    updateSpots() {
        console.log( 'before update spots' );
        super.updateSpots(  ...arguments );
        console.log( 'spots updated' );
    }
}

// ↓ ↓ ↓ ↓ ↓ ↓

class dummy extends __UI__.Component {
    @options text = 'default text';

    constructor( options ) {
        super(options);

        // Create elements
        const div0 = document.createElement( 'div' );
        const text1 = document.createTextNode( '' );

        // Construct dom
        div0.appendChild( document.createTextNode( " Content " ) );
        div0.appendChild( text1 );

        // Update functions
        this.__update__ = {
            text( text ) {
                text1.textContent = text;
            }
        };

        // Set root nodes
        this.nodes = [ div0 ];

        console.log( 'constructor called' );
    }

    updateSpots( __data__ ) {
        console.log( 'before update spots' );

        this.__update__.text( __data__.text );

        console.log( 'spots updated' );
    }

    @options get startDate() {
        return new Date();
    }
}
```
