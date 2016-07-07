import * as application from 'application';
import common = require("./maskedinput-common");
import dependencyObservable = require("ui/core/dependency-observable");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class MaskedInput extends common.MaskedInput {
    private textBefore: string;
    private selectionBefore: number;
    private editTextChange: boolean;
    private newIndex: number;
    private _android: android.widget.EditText;

    get android(): android.widget.EditText {
        return this._android;
    }

    public _createUI() {
        // console.log("_createUI");
        this._android = new android.widget.EditText(this._context);
        this._configureEditText();

        let that = new WeakRef(this);

        let focusChangeListener = new android.view.View.OnFocusChangeListener({
            onFocusChange: function(view: android.view.View, hasFocus: boolean) {
                // console.log("onFocusChange");
                let owner = that.get();
                if (!owner) {
                    return;
                }

                if (!hasFocus) {
                    // console.log("Lost Focus!");
                    owner.dismissSoftInput();
                    owner.bypassEvent = true;
                    owner.text = owner.FormattedText;
                }
                else {
                    // console.log("Gain Focus");
                    owner.initialText = false; //Set initial to false because when field is not bound, initialText is still set to true.
                    owner.focus();
                    owner.editTextChange = true;
                    owner.text = owner.stringBuilder;
                }
            }
        });
        this.android.setOnFocusChangeListener(focusChangeListener);
        this.buildRegEx();
    }

    public _configureEditText() {
        // console.log("_configureEditText");
        let that = new WeakRef(this);

        this.initialText = true; //Always for first creation

        this.android.addTextChangedListener(new android.text.TextWatcher({
            beforeTextChanged(s: string, index: number, toBeReplaced: number, addedCount: number): void {
                let owner = that.get();
                // console.log("beforeTextChanged");
                // console.log("isUpdate: " + isUpdate);
                owner.textBefore = s.toString();
                owner.selectionBefore = owner.android.getSelectionEnd();

                // console.log("s: " + s);
                // console.log("stringBuilder:" + owner.stringBuilder);
                // console.log("index: " + index);
                // console.log("toBeReplaced: " + toBeReplaced);
                // console.log("addedCount: " + addedCount);
            },
            onTextChanged(s: string, index: number, replacedCount: number, addedCount: number): void {
                let owner = that.get();
                // console.log("onTextChanged");

                if (owner.bypassEvent) {
                    // console.log("bypassEvent");
                    owner.initialText = false;
                    owner.editTextChange = false;
                    owner.bypassEvent = false;
                    return;
                }
                else if (owner.initialText) {
                    let sbIdx: number = 0;
                    let s1: string = s.toString(); //Force String Type

                    // console.log("initialText");
                    // console.log("s: " + s1);
                    // console.log("FormattedText: " + owner.FormattedText);

                    // console.log("s.length: " + s1.length);
                    // console.log("Pre stringBuilder: " + owner.stringBuilder);
                    for (let i = 0; i < s1.length; i++) {
                        // console.log("regex test:" + owner.testCharAtIndex(s1.charAt(i),sbIdx));
                        if (owner.testCharAtIndex(s1.charAt(i), sbIdx)) {
                            //This works for FormattedText
                            owner.replacePlaceholder(sbIdx, s1.charAt(i));
                            sbIdx++;
                        }
                        else {
                            //Try to convert RawText
                            // console.log("next placeholder index: " + owner.findIndex());
                            let nextIdx = owner.findIndex();
                            // console.log("regex test:" + owner.testCharAtIndex(s1.charAt(i),nextIdx));
                            if (owner.testCharAtIndex(s1.charAt(i), nextIdx)) {
                                owner.replacePlaceholder(nextIdx, s1.charAt(i));
                                sbIdx = nextIdx + 1;
                            }
                        }
                        // console.log("sbIdx: " + sbIdx.toString());
                    }
                    // console.log("Post stringBuilder: " + owner.stringBuilder);

                    owner.bypassEvent = true;
                    owner.text = owner.FormattedText;
                    //owner.initialText = false;
                    // owner.editTextChange = true;

                    return;
                }
                else if (owner.editTextChange) {
                    // console.log("editTextChange");
                    // console.log("owner.newIndex: " + owner.newIndex);
                    if (owner.newIndex) {
                        owner.android.setSelection(owner.newIndex);
                    }
                    else{
                      owner.android.setSelection(owner.findIndex());
                    }
                    owner.setInputTypeBasedOnMask();
                    owner.editTextChange = false;
                    return;
                }

                try {
                    // console.log("s: " + s);
                    // console.log("index: " + index);
                    // console.log("toBeReplaced: " + replacedCount);
                    // console.log("addedCount: " + addedCount);
                    // console.log("stringBuilder Length:" + owner.stringBuilder.length);

                    //Override Events
                    //Handle Delete/Backspace
                    if (replacedCount > 0 && addedCount === 0) {
                        // console.log("backspace");
                        owner.editTextChange = true;
                        owner.replacePlaceholder(index, owner.placeholder);
                        return;
                    }
                    //Handle backspace hack for last index, otherwise fatal error.
                    else if (index + replacedCount === owner.stringBuilder.length) {
                        // console.log("backspace hack");
                        // console.log("s.length: " + s.toString().length);
                        // console.log("owner.textBefore: " + owner.textBefore);
                        owner.editTextChange = true;

                        if(s.toString().length > owner.stringBuilder.length){
                          //Additional Character Test after last index
                          owner.android.setText(owner.textBefore);
                        }else{
                          //Last Index Backspace/Delete
                          owner.replacePlaceholder(owner.stringBuilder.length - 1, owner.placeholder);
                        }

                        return;
                    }
                    //End Override Events

                    //Handle Text Change
                    if (!owner.editTextChange) {
                        owner.editTextChange = true;
                        let newChar: string = s.charAt(index);
                        //Test Char for Pattern
                        // console.log("newChar: " + newChar);
                        // console.log("regex test:" + owner.testCharAtIndex(newChar,index));
                        if (owner.testCharAtIndex(newChar, index)) {
                            owner.replacePlaceholder(index, newChar);
                            // console.log("new builder:" + that.stringBuilder);
                            // that.android.setText(that.stringBuilder);
                            // that.android.setSelection(that.findIndex());
                        }
                        else {
                            // console.log("prevString: " + owner.textBefore);
                            owner.android.setText(owner.textBefore);
                            // owner.text = owner.textBefore;
                            // owner.android.setSelection(owner.findIndex());
                        }
                    }
                    else {
                        owner.editTextChange = false;
                    }
                }
                catch (e) {
                    // console.log("textChange Catch");
                    owner.editTextChange = true;
                    owner.newIndex = owner.selectionBefore;
                    owner.android.setText(owner.textBefore);
                    // owner.text = owner.textBefore;
                }
            },
            afterTextChanged(s: android.text.Editable): void {
                let owner = that.get();
                // console.log("afterTextChanged");
                // console.log("editTextChange: " + owner.editTextChange);
                // console.log("initialText: " + owner.initialText);

                if (owner.initialText) {
                    owner.initialText = false;
                    return;
                }

                if (owner.editTextChange) {
                    // console.log("stringBuilder: " + owner.stringBuilder);
                    // console.log("stringBuilder Length:" + owner.stringBuilder.length);
                    owner.text = owner.stringBuilder;
                    owner.android.setSelection(owner.findIndex());
                    owner.setInputTypeBasedOnMask();
                    // console.log("full RegEx: " + owner.regEx);
                }
            }
        }));
    }
}
