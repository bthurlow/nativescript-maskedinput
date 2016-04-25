declare module "nativescript-maskedinput"
{
  import textView = require("ui/text-view");
  import editableTextBase = require("ui/editable-text-base");
  import dependencyObservable = require("ui/core/dependency-observable");

  export class MaskedInput extends textView.TextView
  {
    constructor(options?: editableTextBase.Options);

    mask:string;
    stringBuilder:string;
    regEx:string;
    placeholder:string;
    RawText:string;
    FormattedText:string;
    text:string;
    valid:boolean;
  }
}
