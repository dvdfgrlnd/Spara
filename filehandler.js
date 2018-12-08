class FileHandler {
    constructor() {
        // The Client ID obtained from the Google API Console. Replace with your own Client ID.
        this.CLIENT_ID = '596737081995-cjn31b71jplhhas0l4atid66fa12l7fq.apps.googleusercontent.com';
        this.API_KEY = 'AIzaSyBQ_SpEc8r0YtLyLnx66B058ULORWVIwp8';

        // Replace with your own project number from console.developers.google.com.
        // See "Project number" under "IAM & Admin" > "Settings"
        this.APP_ID = "596737081995";
        this.MIME_TYPE = "application/json";

        // Scope to use to access user's Drive items.
        this.SCOPE = 'https://www.googleapis.com/auth/drive';
        this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

        this.pickerApiLoaded = false;
        this.authApiLoaded = false;
    }

    // Use the Google API Loader script to load the google.picker script.
    loadLibrary(callback) {
        let func = this._onPickerLoaded(callback);
        window.gapi.load('picker', { 'callback': this._onPickerApiLoad(func) });
        // Load client api
        gapi.load('client:auth2', this.initClient(func).bind(this));
    }

    initClient(func) {
        let that = this;
        return function () {
            gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: this.DISCOVERY_DOCS,
                scope: this.SCOPE
            }).then(function () {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
                    that.updateSigninStatus(isSignedIn, func);
                });

                // Handle the initial sign-in state.
                that.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get(), func);

                gapi.auth2.getAuthInstance().signIn();
            }, function (error) {
                func();
            });
        }
    }

    updateSigninStatus(isSignedIn, func) {
        if (isSignedIn) {
            this.authApiLoaded = true;
            console.log('Signed in');
            func();
        } else {
            console.log('Signed out');
        }
    }

    _onPickerLoaded(callback) {
        return () => {
            if (this.pickerApiLoaded && this.authApiLoaded) {
                callback();
            }
        }
    }

    _onPickerApiLoad(func) {
        return () => {
            this.pickerApiLoaded = true;
            func();
        }
    }

    // Create and render a Picker object for searching images.
    openFile(callback) {
        let accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token
        // When both the picker and oAuth api are loaded open the file picker
        var view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes(this.MIME_TYPE);
        var picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setAppId(this.APP_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setDeveloperKey(this.API_KEY)
            .setCallback(this._pickerCallback(callback))
            .build();
        picker.setVisible(true);
    }

    // A simple callback implementation.
    _pickerCallback(callback) {
        return (data) => {
            // Load client api
            if (data.action == google.picker.Action.PICKED) {
                var fileId = data.docs[0].id;
                callback(fileId, data.docs[0].name);
            }
        }
    }

    updateFile(fileId, content, callback) {
        let file = new Blob([content], { type: "text/plain" });
        let form = new FormData();
        form.append("file", file);

        var accessToken = window.gapi.auth.getToken().access_token;
        var myInit = {
            method: 'PATCH',
            headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'text/plain' },
            responseType: "json",
            body: content
        };
        let url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
        var myRequest = new Request(url, myInit);

        fetch(myRequest).then(function (response) {
            return response.text();
        }).then(function (text) {
            callback(text);
        });
    }

    downloadFile(fileId, callback) {
        var request = window.gapi.client.drive.files.get({
            'fileId': fileId, 'alt': 'media'
        });
        request.execute((file) => {
            if (Array.isArray(file)) {
                callback(file);
            } else {
                callback(null);
            }
        });
    }

}