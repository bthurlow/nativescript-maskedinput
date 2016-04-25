import common = require("./maskedinput-common");
import * as textView from "ui/text-view";
import {isNullOrUndefined} from "utils/types";
// import * as style from "ui/styling/style";
import {PropertyChangeData} from "ui/core/dependency-observable";
import {TextBase} from "ui/text-base";
import {UpdateTextTrigger} from "ui/enums";

global.moduleMerge(common, exports);

declare function NSMakeRange(loc:number, len:number):NSRange; //Missing Definition

class MaskedInputDelegateImpl extends NSObject implements UITextViewDelegate {
    public static ObjCProtocols = [UITextViewDelegate];

    private nextIdx:number;
    private prevString:string;

    private _owner: WeakRef<MaskedInput>;
    public static initWithOwner(owner: WeakRef<MaskedInput>): MaskedInputDelegateImpl {
        let impl = <MaskedInputDelegateImpl>MaskedInputDelegateImpl.new();
        impl._owner = owner;
        return impl;
    }

    public textViewShouldBeginEditing(textView: UITextView): boolean {
      // console.log("textViewShouldBeginEditing");
        let owner = this._owner.get();
        if (owner) {
            owner._hideHint();
        }

        return true;
    }

    public textViewDidBeginEditing(textView: UITextView) {
      // console.log("textViewDidBeginEditing");
        let owner = this._owner.get();
        if (owner) {
          let that = this;

            textView.text = owner.stringBuilder;
            setTimeout(function(){
              that.setCursor(textView);
            },10);
            this.prevString = textView.text.toString();
            //Update keyboardType
            owner.setInputTypeBasedOnMask();
            textView.reloadInputViews();

            // owner.style._updateTextDecoration();
            // owner.style._updateTextTransform();
        }
    }

    private setCursor(textView: UITextView):void{
      let owner = this._owner.get();
      if (owner) {
        // console.log("setCursor");
        // console.log("position idx: " + owner.findIndex());
        this.nextIdx = owner.findIndex();
        textView.selectedRange = NSMakeRange(this.nextIdx,0);
      }
    }

    public textViewDidEndEditing(textView: UITextView) {
      // console.log("textViewDidEndEditing");
        let owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === UpdateTextTrigger.focusLost) {
                owner._onPropertyChangedFromNative(TextBase.textProperty, textView.text);
            }

            owner.dismissSoftInput();
            owner._refreshHintState(owner.hint, textView.text);

            // owner.style._updateTextDecoration();
            // owner.style._updateTextTransform();

            // console.log(owner.FormattedText);
            owner.ios.text = owner.FormattedText;
        }
    }

    public textViewShouldChangeTextInRangeReplacementText(textView:UITextView, range:NSRange, replacementText:string):boolean{
      // console.log("textViewShouldChangeTextInRangeReplacementText");
      // console.log("Range: " + range.location);
      // console.log("Replacement Text:" + replacementText);

      let owner = this._owner.get();
      if (owner) {

        let newChar:string = replacementText.toString();
        if(range.length === 0){
          //New Text
          //Test Char for Pattern
          // console.log("newChar: " + newChar);
          // console.log("regex test:" + owner.testCharAtIndex(newChar,range.location));
          if(owner.testCharAtIndex(newChar,range.location)){
            owner.replacePlaceholder(range.location,newChar);
            // console.log("new builder:" + owner.stringBuilder);
          }
          else{
            return false;
          }
        }
        else{
          //Delete
          // console.log("Delete Called");
          owner.replacePlaceholder(range.location,owner.placeholder);
        }
      }
      return true;
    }

    public textViewDidChange(textView: UITextView) {
      // console.log("textViewDidChange");
        let owner = this._owner.get();
        if (owner) {
          let s:string = textView.text.toString();
          let newChar:string = s.charAt(this.nextIdx);

          textView.text = owner.stringBuilder;

          //Update cursor postion
          this.setCursor(textView);

          //Update keyboardType
          owner.setInputTypeBasedOnMask();
          textView.reloadInputViews();

          //Set new previous string
          this.prevString = textView.text.toString();

            var range = textView.selectedRange;
            // owner.style._updateTextDecoration();
            // owner.style._updateTextTransform();
            textView.selectedRange = range;

            if (owner.updateTextTrigger === UpdateTextTrigger.textChanged) {
                owner._onPropertyChangedFromNative(TextBase.textProperty, textView.text);
            }
        }
    }
}

export class MaskedInput extends common.MaskedInput{
  private _ios: UITextView;
  private _delegate: MaskedInputDelegateImpl;

  constructor(){
    super();

    this._ios = new UITextView();
    if (!this._ios.font) {
        this._ios.font = UIFont.systemFontOfSize(12);
    }
    this._delegate = MaskedInputDelegateImpl.initWithOwner(new WeakRef(this));
  }

  public onLoaded() {
    // console.log("onLoaded");
    super.onLoaded();
    this._ios.delegate = this._delegate;

    // console.log("initialText: " + this.initialText);
    if(this.initialText){
      // console.log("FormattedText: " + this.FormattedText);
      this._hideHint();
      this.initialText = false;

      if (this.updateTextTrigger === UpdateTextTrigger.textChanged) {
          this._onPropertyChangedFromNative(TextBase.textProperty, this.FormattedText);
      }
    }

    this.buildRegEx();

    // this.style._updateTextDecoration();
    // this.style._updateTextTransform();
  }

  public onUnloaded() {
    this._ios.delegate = null;
    super.onUnloaded();
  }

  get ios(): UITextView {
    return this._ios;
  }

  public _onEditablePropertyChanged(data: PropertyChangeData) {
      this._ios.editable = data.newValue;
  }

  public _onHintPropertyChanged(data: PropertyChangeData) {
      this._refreshHintState(data.newValue, this.text);
  }

  public _onTextPropertyChanged(data: PropertyChangeData) {
      // super._onTextPropertyChanged(data);
      this._refreshHintState(this.hint, data.newValue);
  }

  public _refreshHintState(hint: string, text: string) {
      if (hint && !text) {
          this._showHint(hint);
      }
      else {
          this._hideHint();
      }
  }

  public _showHint(hint: string) {
      this.ios.textColor = this.ios.textColor ? this.ios.textColor.colorWithAlphaComponent(0.22) : UIColor.blackColor().colorWithAlphaComponent(0.22);
      this.ios.text = isNullOrUndefined(hint) ? "" : hint + "";
      (<any>this.ios).isShowingHint = true;
  }

  public _hideHint() {
      this.ios.textColor = this.color ? this.color.ios : null;
      this.ios.text = isNullOrUndefined(this.FormattedText) ? "" : this.FormattedText + "";
      (<any>this.ios).isShowingHint = false;
  }
}
