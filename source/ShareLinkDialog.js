//   Copyright 2012 Hewlett-Packard Development Company, L.P.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

//   Defining the Share dialog and what apps reside in it
enyo.kind({
    name: "ShareLinkDialog",
    kind: "AcceptCancelPopup",
    acceptCaption: "", // Don't want the accept button, set caption to ""
    events: {
        onShareClicked: ""
    },
    SHARE_LINK_LIST: [{
        title: $L("Email"), 
        image: "images/icons/email-32x32.png", 
        type: "email",
        exists: true
    },{
        title: $L("Messaging"), 
        image: "images/icons/messaging-32x32.png",
        type: "messaging",
        exists: true
    },{
        title: "Carbon",
        image: "images/icons/sparrow-32x32.png",
        type: "carbon",
        checkExistance: true
    },{
        title: "Facebook",
        image: "images/icons/facebook-32x32.png",
        type: "facebook",
        checkExistance: true
    },{
        title: "Spaz",
        image: "images/icons/sparrow-32x32.png",
        type: "spaz",
        checkExistance: "true"
    }],

    components: [{
		name: "appCatalogService",
        kind: enyo.PalmService,
        service: "palm://com.palm.applicationManager",
        method: "launch",
        onSuccess: "launchAppCatalogSuccess",
        onFailure: "launchAppCatalogError"
    },{
        name: "listApplicationsService",
        kind: enyo.PalmService,
        service: enyo.palmServices.application,
        onSuccess: "listApplicationsSuccess",
        onFailure: "listApplicationsError",
        method: "listApps"
    }, {
		name: "launchApplicationService",
        kind: enyo.PalmService,
        service: enyo.palmServices.application,
        method: "open"
    },{
        name: "shareMessage",
        content: $L("Share Link"),
        className: "enyo-modaldialog-title"
    },{
        kind: "Control",
        className:"box-center",
        style:"margin-top:24px",
        components: [{
            name: "shareList", 
            kind: "VirtualRepeater", 
            onclick: "shareButtonClicked", 
            onSetupRow: "getItem", 
            layoutKind: "HFlexLayout",
            align: "center",
            components: [{
                name: "item",
                kind: "Control",
                layoutKind: "HFlexLayout",
                align: "center",
                components: [{
                    name: "button",
                    kind: "Button",
                    layoutKind: "HFlexLayout",
                    align:"center",
                    flex: 1,
                    components: [{
                        name: "icon",
                        kind: "Image",
                        className: "icon-image"
                    }, {
                        name: "caption",
                    }, {
                        name: "spinner",
                        kind: "Spinner",
                        className: "app-exists-spinner"
                    }]   
                }, {
                    name: "downloadButton",
                    kind: "CustomButton",
                    showing: true,
                    className: "download-button"
                }]
            }]
        }]
    }],
    url: "",
    title: "",
    init: function (url, title) {
        this.url = url;
        this.title = title;
    },
    open: function () {
        this.inherited(arguments);
        this.getListApplications();
    },
    getListApplications: function () {
        this.$.listApplicationsService.call();
    },
    getItem: function (inSender, inIndex) {
        if (inIndex < this.SHARE_LINK_LIST.length) {
            if (!this.$.shareMessage.getContent()) {
                this.$.shareMessage.setContent("Share link via");
            }

            this.$.downloadButton.show();

            var itemDefinition = this.SHARE_LINK_LIST[inIndex];
            this.$.icon.setSrc(itemDefinition.image);
            if (itemDefinition.checkExistance) {
                this.$.button.setDisabled(true);
                this.$.spinner.show();
            } else {
                this.$.button.setDisabled(!itemDefinition.exists);
                if (itemDefinition.exists) {
                    this.$.downloadButton.hide();
                }
                this.$.spinner.hide();
            }
            this.$.caption.setContent(itemDefinition.title);
            return true;
        }
    },
    shareButtonClicked: function (inSender, inEvent) {
        var shareService = this.SHARE_LINK_LIST[inEvent.rowIndex];
        var shareServiceType = shareService.type;

//Check whether the apps and their subsequental service are installed
//and give the option to download if necessary
        if (!shareService.exists) {
            if (shareServiceType === "facebook") {
                this.downloadFacebookApp();
            } else if (shareServiceType === "carbon") {
                this.downloadCarbonApp();
            }  else if (shareServiceType === "spaz") {
                this.downloadSpazApp();
            }
            return true;
        }

       //Call the service to share the current link 
        if (shareServiceType === "email") {
            this.shareLinkViaEmail();
        } else if (shareServiceType === "messaging") {
            this.shareLinkViaMessaging();
        } else if (shareServiceType === "facebook") {
            this.shareLinkViaFacebook();
          } else if (shareServiceType === "carbon") {
          this.shareLinkViaCarbon();
          } else if (shareServiceType === "spaz") {
          this.shareLinkViaSpaz();
          }
        this.close();
    },
    shareLinkViaEmail: function () {
	    var msg = $L("Here's a website I think you'll like: <a href=\"{$src}\">{$title}</a>");
		msg = enyo.macroize(msg, {src: this.url, title: this.title || this.url});
		var params = {
			summary: $L("Check out this web page..."),
			text: msg
		};
		this.$.launchApplicationService.call({id: "com.palm.app.email", params: params});
    },
    shareLinkViaMessaging: function () {
        var params = {
            compose: {
                messageText: $L("Check out this web page: ") + this.url
            }
        };
        this.$.launchApplicationService.call({id: "com.palm.app.messaging", params: params});
    },
    shareLinkViaCarbon: function () {
          var params = {
          action: "compose",
          body: "Check out this web page: " + this.url
          };
          this.$.launchApplicationService.call({id: "com.appstuh.sparrow", params: params});
        },
    shareLinkViaFacebook: function () {
        var params = {
            type: "status",
            statusText: $L("Check out this web page: ") + this.url
        };
        this.$.launchApplicationService.call({id: "com.palm.app.facebook", params: params});
    },
        shareLinkViaSpaz: function () {
          var params = {
          action: "post",
          tweet: "Check out this web page: " + this.url
          };
          this.$.launchApplicationService.call({id: "com.funkatron.app.spaz", params: params});
        },
    downloadFacebookApp: function () {
        this.log("Launching app catalog to download facebook");
        this.$.appCatalogService.call({id: "com.palm.app.enyo-findapps", params: {
            target: "http://developer.palm.com/appredirect/?packageid=com.palm.app.facebook"
        }});
    },
    downloadCarbonApp: function () {
        this.log("Launching app catalog to download Carbon");
        this.$.appCatalogService.call({id: "com.palm.app.enyo-findapps", params: {
            target: "http://developer.palm.com/appredirect/?packageid=com.dotsandline.carbon"
        }});
    },
    downloadSpazApp: function () {
        this.log("Launching app catalog to download Spaz");
        this.$.appCatalogService.call({id: "com.palm.app.enyo-findapps", params: {
            target: "http://developer.palm.com/appredirect/?packageid=com.funkatron.app.spaz"
        }});

    listApplicationsSuccess: function (inSender, inResponse) {
        var apps = inResponse.apps;
        foundFacebook = apps.some(function (app) {
            this.log(enyo.json.stringify(app));
            if (app.id === "com.palm.app.enyo-facebook") {

                this.SHARE_LINK_LIST.some(function (shareService, index) {
                    if (shareService.title === "Facebook") {
                        shareService.exists = true;
                        shareService.checkExistance = false;
                        this.$.shareList.renderRow(index);
                    }
                }, this);
                return true;
            }
        }, this);

        if (!foundFacebook) {
            this.SHARE_LINK_LIST.some(function (shareService, index) {
                if (shareService.title === "Facebook") {
                    shareService.exists = false;
                    shareService.checkExistance = false;
                    this.$.shareList.renderRow(index);
                }
            }, this);
        }

        foundCarbon = apps.some(function (app) {
            this.log(enyo.json.stringify(app));
            if (app.id === "com.dotsandlines.carbon") {

                this.SHARE_LINK_LIST.some(function (shareService, index) {
                    if (shareService.title === "Carbon") {
                        shareService.exists = true;
                        shareService.checkExistance = false;
                        this.$.shareList.renderRow(index);
                    }
                }, this);
                return true;
            }
        }, this);

        if (!foundCarbon) {
            this.SHARE_LINK_LIST.some(function (shareService, index) {
                if (shareService.title === "Carbon") {
                    shareService.exists = false;
                    shareService.checkExistance = false;
                    this.$.shareList.renderRow(index);
                }
            }, this);
        }

        foundSpaz = apps.some(function (app) {
            this.log(enyo.json.stringify(app));
            if (app.id === "com.funkatron.app.spaz") {

                this.SHARE_LINK_LIST.some(function (shareService, index) {
                    if (shareService.title === "Spaz") {
                        shareService.exists = true;
                        shareService.checkExistance = false;
                        this.$.shareList.renderRow(index);
                    }
                }, this);
                return true;
            }
        }, this);

        if (!foundSpaz) {
            this.SHARE_LINK_LIST.some(function (shareService, index) {
                if (shareService.title === "Spaz") {
                    shareService.exists = false;
                    shareService.checkExistance = false;
                    this.$.shareList.renderRow(index);
                }
            }, this);
        }
    },
    launchAppCatalogSuccess: function (inSender, inResponse) {
        this.close();
    } 
});
