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
        this.SCOPE = ['https://www.googleapis.com/auth/drive'];

        this.pickerApiLoaded = false;
        this.authApiLoaded = false;
        this.clientApiLoaded = false;
        this.driveApiLoaded = false;
        this.oauthToken = "ya29.GlxqBjWAkKZQtp9U_qBCJydFej3QJoR3BnkAPEBmflM5y86WCf9_lLMMlIAGenKI7r-dTcYwgO0YveR262vWo4F5hoRH1KJapSjMSd6-RFOKob0Y0Au6_WL5c_8i2w";
    }

    // Use the Google API Loader script to load the google.picker script.
    loadLibrary(callback) {
        let func = this._onPickerLoaded(callback);
        window.gapi.load('auth', { 'callback': this._onAuthApiLoad(func) });
        window.gapi.load('picker', { 'callback': this._onPickerApiLoad(func) });
        // Load client api
        window.gapi.load('client', this._onClientApiLoad(func));
    }

    _onClientApiLoad(func) {
        return () => {
            this.clientApiLoaded = true;
            // Load drive api
            window.gapi.client.load('drive', 'v2', this._onDriveApiLoad(func));
        };
    }

    _onDriveApiLoad(func) {
        return () => {
            this.driveApiLoaded = true;
            func();
        };
    }

    _onPickerLoaded(callback) {
        return () => {
            if (this.pickerApiLoaded && this.authApiLoaded && this.clientApiLoaded && this.driveApiLoaded) {
                this.authorize(callback);
                // callback();
                // this.openPicker();
            }
        }
    }

    _onAuthApiLoad(func) {
        return () => {
            console.log('onauthapiload');
            this.authApiLoaded = true;
            func();
        }
    }

    authorize(callback) {
        window.gapi.auth.authorize(
            {
                'client_id': this.CLIENT_ID,
                'scope': this.SCOPE,
                'immediate': false
            },
            this._handleAuthResult(callback));
    }

    _onPickerApiLoad(func) {
        return () => {
            console.log('onpickerapiload');
            this.pickerApiLoaded = true;
            func();
        }
    }

    _handleAuthResult(func) {
        return (authResult) => {
            if (authResult && !authResult.error) {
                this.oauthToken = authResult.access_token;
                func();
            }
        }
    }

    // Create and render a Picker object for searching images.
    openFile(callback) {
        // When both the picker and oAuth api are loaded open the file picker
        var view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes(this.MIME_TYPE);
        var picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
            .setAppId(this.APP_ID)
            .setOAuthToken(this.oauthToken)
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
                callback(fileId);
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
            headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type':'text/plain' },
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
            'fileId': fileId
        });
        request.execute((file) => {
            if (file.downloadUrl) {
                var accessToken = window.gapi.auth.getToken().access_token;

                var myInit = {
                    method: 'GET',
                    headers: { 'Authorization': 'Bearer ' + accessToken }
                };

                var myRequest = new Request(file.downloadUrl, myInit);

                fetch(myRequest).then(function (response) {
                    return response.text();
                }).then(function (text) {
                    callback(text);
                });
            } else {
                callback(null);
            }
        });
    }

}