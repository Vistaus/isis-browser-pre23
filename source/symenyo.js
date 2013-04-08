var hacks_deviceInfo = enyo.fetchDeviceInfo();
var hacks_isPhone = hacks_deviceInfo.platformVersionMajor <= 2;
if (hacks_isPhone) {
   document.addEventListener("keydown", function(event) {
      if (event.keyCode === 17) {
         window.hacks_symKeyTarget = event.target;
         new PalmServiceBridge().call("palm://com.palm.applicationManager/launch", "{\"id\": \"com.palm.systemui\", \"params\": {\"action\": \"showAltChar\"}}");
      }
   });
   window.hacks_sendFakeKey = function(type, charCode) {
      var e = document.createEvent("Events");
      e.initEvent(type, true, true);

      e.keyCode = charCode;
      e.charCode = charCode;
      e.which = charCode;

      window.hacks_symKeyTarget.dispatchEvent(e);
      return e;
   };
   //console.log("enyo.windowParamsChangeHandler: " + enyo.windowParamsChangeHandler);
   // TODO enyo.windowParamsChangeHandler is currently not used by the framework, nevertheless we should call the original
   // function (if defined) in our handler
   enyo.windowParamsChangeHandler = function(event) {
      if (!event.altCharSelected) {
         return false;
      }

      var selection, newEvent, charCode;
      // Put the text into the editable element
      selection = window.getSelection();
      // make sure there are any available range to index as
      // getRangeAt does not protect against that
      if (selection && selection.rangeCount > 0 && selection.getRangeAt(0)) {
         document.execCommand("insertText", true, event.altCharSelected);
      }

      // Fire off our fake events
      charCode = event.altCharSelected.charCodeAt(0);
      window.hacks_sendFakeKey("keydown", charCode);
      window.hacks_sendFakeKey("keypress", charCode);
      window.hacks_sendFakeKey("keyup", charCode);

      //Event.stop(event);
   };

}