var hacks_deviceInfo = enyo.fetchDeviceInfo();
var hacks_isPhone = window.PalmSystem && hacks_deviceInfo.platformVersionMajor <= 2;
if (typeof(window.zoomFactor) === "undefined") {
   window.zoomFactor = 1;
}
if (hacks_isPhone) {
   enyo.WebView.prototype.layoutKind = "HFlexLayout";
   enyo.WebView.prototype.chrome[0] = {
      kind: "Scroller",
      flex: 1,
      components: [enyo.WebView.prototype.chrome[0]]
   };
   enyo.WebView.prototype.style = "min-height: 10000px;";
   var hacks_orig_BasicWebView__connect = enyo.BasicWebView.prototype._connect;
   enyo.BasicWebView.prototype._connect = function() {
      hacks_orig_BasicWebView__connect.apply(this, arguments);
      this.serverConnected();
   };
   // allows us to put BasicWebView inside a Scroller, so that scrolling works
   delete enyo.BasicWebView.prototype.dragstartHandler;
   delete enyo.BasicWebView.prototype.flickHandler;
   // forward click-events
   enyo.BasicWebView.prototype.clickHandler = function(sender, event) {
      // TODO what is the third parameter for?
      this.node.clickAt(event.offsetX * window.zoomFactor, event.offsetY * window.zoomFactor, 0);
   };
   // apparently only called for Sym events
   enyo.BasicWebView.prototype.keypressHandler = function(sender, event) {
      this.node.insertStringAtCursor(String.fromCharCode(event.charCode));
   };
}
