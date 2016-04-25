var dialogs = require("ui/dialogs"),
_page;

function onNavigatingTo(args) {
    _page = args.object;

    //Fix android auto focus.
    if(_page.android){
      var layout = _page.getViewById("DemoLayout").android;
      var firstInputField = _page.getViewById("maskedInput").android;

      layout.setFocusableInTouchMode(true);
      layout.setFocusable(true);
      firstInputField.clearFocus();
    }
}
exports.onNavigatingTo = onNavigatingTo;

exports.testInputClick = function(args){
  var mi = _page.getViewById("maskedInput");
  console.log("MaskedInput Text: " + mi.text);
  console.log("MaskedInput RegEx: " + mi.regEx);
  console.log("MaskedInput RawText: " + mi.RawText);
  console.log("MaskedInput FormattedText: " + mi.FormattedText);
}

exports.validateClick = function(args){
  var mi = _page.getViewById("maskedInput");

  if(mi.valid){
    dialogs.alert({title:"Test Result",message:"Valid",okButtonText:"OK"});
  }else{
    dialogs.alert({title:"Test Result",message:"Not Valid",okButtonText:"OK"});
  }
}
