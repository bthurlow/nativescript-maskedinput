<!--
@Author: Brian Thurlow <bthurlow>
@Date:   04/20/2016 10:42:09 AM
@Last modified by:   Brian Thurlow
@Last modified time: 04/20/2016 11:14:11 AM
-->

# A {N} Masked Input Plugin

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](http://choosealicense.com/licenses/mit/) [![npm](https://img.shields.io/npm/v/nativescript-maskedinput.svg)](https://www.npmjs.com/package/nativescript-maskedinput) [![npm](https://img.shields.io/npm/dt/nativescript-maskedinput.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-maskedinput) [![GitHub release](https://img.shields.io/github/release/bthurlow/nativescript-maskedinput.svg)](https://github.com/bthurlow/nativescript-maskedinput)

This plugin extends the {N} TextView to allow for input masking.

## Notes

iOS 7+

Android API 17+

Plugin does not support the use of the keyboardType property from TextView.

Plugin will attempt to determine the mask type and display the appropriate keyboardType automatically.

## Installation

Run `tns plugin add nativescript-maskedinput`

### Usage

To use MaskedInput you need to include it in your XML.

Add the following to your page directive.
```xmlns
xmlns:mi="nativescript-maskedinput"
```

Use MaskedInput by adding the following XML.
```XML
<mi:MaskedInput mask="1-999-999-9999? x999" hint="1-555-555-5555" placeholder="#" />
```

### Properties

#### mask [string]

Get or Set the mask used for input

#### mask options

- 9 is the same as RegEx [0-9]
- a is the same as RegEx [A-Za-z]
- \* is the same as RegEx [A-Za-z0-9]
- ? specifies that anything after the ? is optional.

###### Supported Seperators
* -
* |
* /
* \
* .
* $
* +
* ( )
* [  ]
* { }

#### valid [boolean]

Returns true or false if the input text matches the mask.

Use the ```FormattedText``` property or the ```text``` property to validate the input.

#### placeholder [string]

Gets or Sets the placeholder.

Default: _

#### RawText [string]

Gets only the text that matches the RegEx pattern from the mask.

You cannot validate the RawText property.  It will fail.

#### FormattedText [string]

Gets the Full text including any seperators as specified in the mask.

#### regEx [string]

Gets the regex that was created from the mask so that you can perform your own validation.
