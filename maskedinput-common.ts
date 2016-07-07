// import view = require("ui/core/view");
import textView = require("ui/text-view");
import textBase = require("ui/text-base");
import editableTextBase = require("ui/editable-text-base");
import dependencyObservable = require("ui/core/dependency-observable");
import observable = require("data/observable");
import enums = require("ui/enums");

global.moduleMerge(textBase, exports);

export class MaskedInput extends textView.TextView //view.View
{
  private _mask: string = "";
  private _stringBuilder: string[] = [];
  private _sbIsPlaceholder: boolean[] = [];
  private _regexArr: string[] = [];
  private _regexOptionalArr: string[] = [];
  private _placeholder: string = "_"; //Default Placeholder
  private _regexReady: boolean = false;
  protected initialText:boolean = false;
  protected bypassEvent:boolean = false;

  constructor(options?: editableTextBase.Options)
  {
    super(options);
    // this.autocorrect = false;
    // this.autocapitalizationType = enums.AutocapitalizationType.none;
  }
  get mask():string
  {
    return this._mask;
  }
  set mask(value:string)
  {
    this._mask = value;
  }

  get stringBuilder():string
  {
    return this._stringBuilder.join("");
  }

  get regEx():string{
    let regex:string;
    regex = "^";

    for(var c=0; c < this._regexArr.length; c++){
      regex += this._regexArr[c] + this._regexOptionalArr[c];
    }

    regex += "$";
    return regex;
  }

  set placeholder(value:string){
    this._placeholder = value;
  }
  get placeholder():string{
    return this._placeholder;
  }

  get RawText():string{
    let s:string = "";

    for(let c:number = 0; c < this._sbIsPlaceholder.length; c++){
      if(this._sbIsPlaceholder[c]){
        if(this._stringBuilder[c] !== this._placeholder){
          s += this._stringBuilder[c];
        }
      }
    }

    return s;
  }

  get FormattedText():string{
    let s:string = "";
    let emptyOptionalPlaceholderIndex:number;
    let firstOptionalPlaceholderIndex:number;

    for(let i:number = 0; i < this._sbIsPlaceholder.length; i++){
      if(this._regexOptionalArr[i] && this._sbIsPlaceholder[i]){
        //Find First Optional Placeholder Index
        if(!firstOptionalPlaceholderIndex){
          firstOptionalPlaceholderIndex = i;
        }
        //Find First Empty Optional Placeholder Index
        if(!emptyOptionalPlaceholderIndex){
          if(this._stringBuilder[i] === this._placeholder){
            emptyOptionalPlaceholderIndex = i;
          }
        }
      }
    }

    // console.log("firstOptionalPlaceholderIndex: " + firstOptionalPlaceholderIndex);
    // console.log("emptyOptionalPlaceholderIndex: " + emptyOptionalPlaceholderIndex);

    for(let c:number = 0; c < this._sbIsPlaceholder.length; c++){
        if(this._regexOptionalArr[c]){
          if(firstOptionalPlaceholderIndex === emptyOptionalPlaceholderIndex){
            break;
          }
        }
        if(this._stringBuilder[c] !== this._placeholder){
          s += this._stringBuilder[c];
        }
    }

    return s;
  }

  set text(value:string){
    let s:string = value.toString(); //Force String Type
    // console.log("set text()");
    // console.log("s value: " + s);
    this._setValue(textBase.TextBase.textProperty, s);
  }
  get text():string{
    // console.log("get text()");
    return this.FormattedText;
  }

  get valid():boolean{
    let r:boolean = false;
    let pattern = new RegExp(this.regEx,"i");

    if(pattern.test(this.FormattedText)){
      r = true;
    }

    return r;
  }

  protected buildRegEx():void
  {
    if(this._regexReady){
      return;
    }
    // console.log("buildRegEx");
    let foundOptional: boolean = false;
    let stringArr = this._mask.split("");

    for(let s of stringArr){
      if(s === "9"){
        this._regexArr.push("[0-9]");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(this._placeholder);
        this._sbIsPlaceholder.push(true);
      }
      else if(s === "a"){
        this._regexArr.push("[A-Za-z]");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(this._placeholder);
        this._sbIsPlaceholder.push(true);
      }
      else if(s === "*"){
        this._regexArr.push("[A-Za-z0-9]");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(this._placeholder);
        this._sbIsPlaceholder.push(true);
      }
      else if(s === "("){
        this._regexArr.push("\(");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === ")"){
        this._regexArr.push("\)");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "."){
        this._regexArr.push("\.");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "$"){
        this._regexArr.push("\$");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "\\"){
        this._regexArr.push("\\");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "/"){
        this._regexArr.push("\/");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "+"){
        this._regexArr.push("\+");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "["){
        this._regexArr.push("\[");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "]"){
        this._regexArr.push("\]");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "{"){
        this._regexArr.push("\{");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "}"){
        this._regexArr.push("\}");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "|"){
        this._regexArr.push("\|");
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
      else if(s === "?"){
        foundOptional = true;
      }
      else{
        this._regexArr.push(s);
        this._regexOptionalArr.push(foundOptional ? "?" : "");
        this._stringBuilder.push(s);
        this._sbIsPlaceholder.push(false);
      }
    }
    this._regexReady = true;
  }

  public findIndex():number
  {
    // console.log("findIndex");
    let idx:number;

    idx = this._stringBuilder.indexOf(this._placeholder);
    // console.log("Pre-Index: " + idx.toString());
    if(idx < 0){
      idx = this._stringBuilder.length;
    }
    // console.log("Post-Index: " + idx.toString());
    return idx;
  }

  protected getNextCharType(idx:number):string{
    let s = this._regexArr[idx];
    if(s && s.replace("?","") === "[0-9]"){
      return "9";
    }
    return "";
  }

  public testCharAtIndex(c:string,idx:number):boolean{
    let valid:boolean = false;

    // //iOS
    // if(c === this._placeholder)

    if(idx <= this._regexArr.length-1){
      let rx = new RegExp(this._regexArr[idx],"g");
      valid = rx.test(c);
    }

    return valid;
  }

  public findPreviousPlaceholder(currentIndex:number):number{
    let previousIdx:number = this._sbIsPlaceholder.lastIndexOf(true,currentIndex-1);
    return previousIdx;
  }

  public replacePlaceholder(idx:number,c:string):void{
    if(idx <= this._stringBuilder.length-1){
      if(c === this._placeholder){
        if(this._sbIsPlaceholder[idx]){
          this._stringBuilder[idx] = c;
        }
        else{
          //Find Previous placeholder index
          let startIdx:number = idx - this._stringBuilder.length - 1;
          // console.log("last index start: " + startIdx);
          let previousIdx:number = this._sbIsPlaceholder.lastIndexOf(true,startIdx);
          if(previousIdx >= 0){
            // console.log("Previous Index: " + previousIdx);
            this._stringBuilder[previousIdx] = c;
          }
        }
      }
      else{
        this._stringBuilder[idx] = c;
      }
    }
  }

  public setInputTypeBasedOnMask():void{
    //Get Next Char Type
    let idx:number = this.findIndex();
    let char:string = this.getNextCharType(idx);
    // console.log("setInputTypeBasedOnMask");
    // console.log("Mask: " + this.mask);
    // console.log("Next Char Type: " + char);
    // console.log("Next Char Idx: " + idx);
    this.getKeyboardTypeForChar(char);
  }

  private getKeyboardTypeForChar(char:string):void{
    switch(char){
      case "9":
        this.keyboardType = enums.KeyboardType.phone;
        break;
      default:
        this.keyboardType = ""; //Set to Text
    }
  }
}
