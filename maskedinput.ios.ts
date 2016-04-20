import common = require("./maskedinput-common");

global.moduleMerge(common, exports);

class UITextViewDelegateImpl extends NSObject implements UITextViewDelegate {
    public static ObjCProtocols = [UITextViewDelegate];

    private _owner: WeakRef<MaskedInput>;
    public static initWithOwner(owner: WeakRef<MaskedInput>): UITextViewDelegateImpl {
        let impl = <UITextViewDelegateImpl>UITextViewDelegateImpl.new();
        impl._owner = owner;
        return impl;
    }

    public textViewShouldBeginEditing(textView: UITextView): boolean {
      console.log("textViewShouldBeginEditing");
        let owner = this._owner.get();
        if (owner) {
            // owner._hideHint();
        }

        return true;
    }

    public textViewDidBeginEditing(textView: UITextView) {
      console.log("textViewDidBeginEditing");
        let owner = this._owner.get();
        if (owner) {
            // owner.style._updateTextDecoration();
            // owner.style._updateTextTransform();
        }
    }

    public textViewDidEndEditing(textView: UITextView) {
      console.log("textViewDidEndEditing");
        let owner = this._owner.get();
        if (owner) {
            // if (owner.updateTextTrigger === UpdateTextTrigger.focusLost) {
            //     owner._onPropertyChangedFromNative(TextBase.textProperty, textView.text);
            // }

            owner.dismissSoftInput();
            // owner._refreshHintState(owner.hint, textView.text);
            //
            // owner.style._updateTextDecoration();
            // owner.style._updateTextTransform();
        }
    }

    public textViewDidChange(textView: UITextView) {
      console.log("textViewDidChange");
        let owner = this._owner.get();
        if (owner) {
            var range = textView.selectedRange;
            // owner.style._updateTextDecoration();
            // owner.style._updateTextTransform();
            textView.selectedRange = range;

            // if (owner.updateTextTrigger === UpdateTextTrigger.textChanged) {
            //     owner._onPropertyChangedFromNative(TextBase.textProperty, textView.text);
            // }
        }
    }
}

export class MaskedInput extends common.MaskedInput{
  private _ios: UITextView;
  private _delegate: UITextViewDelegateImpl;

  constructor(){
    super();

    this._ios = new UITextView();
    // if (!this._ios.font) {
    //     this._ios.font = UIFont.systemFontOfSize(12);
    // }
    this._delegate = UITextViewDelegateImpl.initWithOwner(new WeakRef(this));
  }

  public onLoaded() {
    super.onLoaded();
    this._ios.delegate = this._delegate;

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
}
