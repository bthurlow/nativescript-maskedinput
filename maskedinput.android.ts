import * as application from 'application';
import common = require("./maskedinput-common");
import dependencyObservable = require("ui/core/dependency-observable");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class MaskedInput extends common.MaskedInput{
  private textBefore:string;
  private selectionBefore:number;
  private editTextChange:boolean;
  private newIndex:number;
  // private initialText:boolean;
  private bypassEvent:boolean = false;

  private _android: android.widget.EditText;
  // private _textWatcher: android.text.TextWatcher;
  // private _keyListenerCache: android.text.method.IKeyListener;
  /* tslint:disable */
  // private _dirtyTextAccumulator: string;
  /* tslint:enable */

  get android(): android.widget.EditText {
    return this._android;
  }

  public _createUI() {
    this._android = new android.widget.EditText(this._context);
    this._configureEditText();

    let that = new WeakRef(this);

    let focusChangeListener = new android.view.View.OnFocusChangeListener({
        onFocusChange: function (view: android.view.View, hasFocus: boolean) {
          // console.log("onFocusChange");
            let owner = that.get();
            if (!owner) {
                return;
            }

            if (!hasFocus) {
                owner.dismissSoftInput();
                owner.bypassEvent = true;
                owner.android.setText(owner.FormattedText);
                // console.log("Lost Focus!");
            }
            else{
              owner.initialText = true;
              owner.focus();
              owner.android.setText(owner.stringBuilder);
              owner.android.setSelection(owner.findIndex());
            }
        }
    });
    this.android.setOnFocusChangeListener(focusChangeListener);
    this.buildRegEx();
  }

  public _configureEditText()
  {
    // console.log("_configureEditText");
    let that = new WeakRef(this);

    if(this.initialText){
      this.android.setText(this.FormattedText);
    }

    this.android.addTextChangedListener(new android.text.TextWatcher({
      beforeTextChanged(s:string,index:number,toBeReplaced:number,addedCount:number):void{
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
      onTextChanged(s:string,index:number,replacedCount:number,addedCount:number):void{
        let owner = that.get();

        if(owner.bypassEvent){
          owner.initialText = false;
          owner.editTextChange = false;
          owner.bypassEvent = false;
          return;
        }

        if(owner.initialText){
          owner.initialText = false;
          owner.editTextChange = true;
          return;
        }

        if(owner.editTextChange){
          owner.android.setSelection(owner.newIndex);
          owner.editTextChange = false;
          return;
        }

        try{
            // console.log("onTextChanged");
            // console.log("s: " + s);
            // console.log("index: " + index);
            // console.log("toBeReplaced: " + replacedCount);
            // console.log("addedCount: " + addedCount);
            // console.log("stringBuilder Length:" + owner.stringBuilder.length);

            if(replacedCount > 0 && addedCount === 0){
              owner.editTextChange = true;
              owner.replacePlaceholder(index,owner.placeholder);
              return;
            }

            if(!owner.editTextChange){
              owner.editTextChange = true;
              let newChar:string = s.charAt(index);
              //Test Char for Pattern
              // console.log("newChar: " + newChar);
              // console.log("regex test:" + owner.testCharAtIndex(newChar,index));
              if(owner.testCharAtIndex(newChar,index)){
                owner.replacePlaceholder(index,newChar);
                // console.log("new builder:" + that.stringBuilder);
                // that.android.setText(that.stringBuilder);
                // that.android.setSelection(that.findIndex());
              }
              else{
                // console.log("prevString: " + owner.textBefore);
                owner.android.setText(owner.textBefore);
                owner.android.setSelection(owner.findIndex());
              }
            }
            else{
              owner.editTextChange = false;
            }
        }
        catch(e){
          owner.editTextChange = true;
          owner.newIndex = owner.selectionBefore;
          owner.android.setText(owner.textBefore);
        }
      },
      afterTextChanged(s:android.text.Editable):void{
        let owner = that.get();
          //  console.log("afterTextChanged");
          // console.log("editTextChange: " + that.editTextChange)
          if(owner.editTextChange){
            owner.android.setText(owner.stringBuilder);
            owner.android.setSelection(owner.findIndex());
            owner.setInputTypeBasedOnMask();
            // console.log("full RegEx: " + owner.regEx);
          }
      }
    }));
  }

  set text(value:string){
    this.buildRegEx(); //Ensure regex is built and ready!
    let s:string = value.toString(); //Force String Type
    let sbIdx:number = 0;

    // console.log("set text");
    // console.log("value: " + s);
    // console.log("value.length: " + s.length);
    // console.log("Pre stringBuilder: " + this.stringBuilder);

    for(let i=0; i < s.length; i++){
      // console.log("regex test:" + this.testCharAtIndex(s.charAt(i),sbIdx));
      if(this.testCharAtIndex(s.charAt(i),sbIdx)){
        //This works for FormattedText
        this.replacePlaceholder(sbIdx,s.charAt(i));
        sbIdx++;
      }
      else{
        //Try to convert RawText
        // console.log("next placeholder index: " + this.findIndex());
        let nextIdx = this.findIndex();
        // console.log("regex test:" + this.testCharAtIndex(s.charAt(i),nextIdx));
        if(this.testCharAtIndex(s.charAt(i),nextIdx)){
          this.replacePlaceholder(nextIdx,s.charAt(i));
          sbIdx = nextIdx + 1;
        }
      }
      // console.log("sbIdx: " + sbIdx.toString());
    }
    // console.log("Post stringBuilder: " + this.stringBuilder);

    this.initialText = true;
  }
}
