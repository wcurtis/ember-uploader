var get = Ember.get,
    set = Ember.set;

Ember.Uploader = Ember.Object.extend(Ember.Evented, {
  file: null,
  url: null,
  progress: 0,

  upload: function() {
    var data = this.setupFormData(),
        url  = get(this, 'url'),
        self = this;

    set(this, 'isUploading', true);

    return this.ajax(url, data).then(function(respData) {
      self.didUpload(respData);
      return respData;
    });
  },

  setupFormData: function(obj) {
    var data = new FormData();
    var file = get(this, 'file');

    if (typeof obj === 'undefined') {
      obj = {};
    }

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        data.append(prop, obj[prop]);
      }
    }

    data.append('file', file);

    return data;
  },

  didUpload: function(data) {
    var file = get(this, 'file');

    set(this, 'isUploading', false);

    // Hack to get around small file progress
    if (get(this, 'progress') === 0) {
      this.didProgress({
        total: file.size,
        loaded: file.size
      });
    }

    this.trigger('didUpload', data);
  },

  didProgress: function(e) {
    set(this, 'progress', e.loaded / e.total * 100);
    this.trigger('progress', e);
  },

  _xhr: function() {
    var xhr = Ember.$.ajaxSettings.xhr();
    xhr.upload.onprogress = this.didProgress.bind(this);
    return xhr;
  },

  ajax: function(url, params, method) {
    var settings = {
      url: url,
      type: method || 'POST',
      contentType: false,
      processData: false,
      xhr: get(this, 'xhr'),
      data: params
    };

    return this._ajax(settings);
  },

  _ajax: function(settings) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      settings.success = function(data) {
        Ember.run(null, resolve, data);
      };

      settings.error = function(jqXHR, textStatus, errorThrown) {
        Ember.run(null, reject, jqXHR);
      };

      Ember.$.ajax(settings);
    });
  }
});