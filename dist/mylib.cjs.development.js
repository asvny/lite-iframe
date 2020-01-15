'use strict';

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function addPrefetch(kind, url, as) {
  var linkElem = document.createElement('link');
  linkElem.rel = kind;
  linkElem.href = url;

  if (as) {
    linkElem.as = as;
  }

  linkElem.crossOrigin = 'true';
  document.head.append(linkElem);
}

var Unknown =
/*#__PURE__*/
function () {
  function Unknown(instance, src) {
    this.instance = instance;
    this.src = src;
    this.preconnected = false;
    this.warmUp = this.warmUp.bind(this);
    this.addIframe = this.addIframe.bind(this);
    this.handleIntersection = this.handleIntersection.bind(this);

    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(this.handleIntersection);
    } else {
      this.handleIframe();
    }
  }

  var _proto = Unknown.prototype;

  _proto.connectedCallback = function connectedCallback() {
    if (this.io) {
      this.io.observe(this.instance);
    }
  };

  _proto.handleIntersection = function handleIntersection(data) {
    if (data[0].isIntersecting) {
      this.handleIframe();
      this.cleanup();
    }
  };

  _proto.handleIframe = function handleIframe() {
    this.addIframe();
  };

  _proto.cleanup = function cleanup() {
    if (this.io) {
      this.io.disconnect();
    }
  };

  _proto.warmUp = function warmUp() {
    if (this.src) addPrefetch('preload', this.src, 'iframe');
  };

  _proto.addIframe = function addIframe() {
    var iframeHTML = "\n      <iframe \n        width=\"560\" \n        height=\"315\" \n        frameborder=\"0\" \n        loading=\"lazy\"\n        allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen\n        src=\"" + this.src + "\">\n      </iframe>";
    this.instance.insertAdjacentHTML('beforeend', iframeHTML);
  };

  return Unknown;
}();

var Youtube =
/*#__PURE__*/
function () {
  function Youtube(instance, src) {
    this.preconnected = false;
    this.instance = instance;
    this.src = src;
    this.warmUp = this.warmUp.bind(this);
    this.addIframe = this.addIframe.bind(this);
    this.posterUrl = "https://i.ytimg.com/vi/" + this.videoId + "/hqdefault.jpg";
    addPrefetch('preload', this.posterUrl, 'image');
  }

  var _proto2 = Youtube.prototype;

  _proto2.connectedCallback = function connectedCallback() {
    var _this = this;

    this.instance.style.backgroundImage = "url(\"" + this.posterUrl + "\")";
    var playBtn = document.createElement('div');
    playBtn.classList.add('lty-playbtn');
    this.instance.append(playBtn);
    this.instance.addEventListener('pointerover', this.warmUp, {
      once: true
    });
    this.instance.addEventListener('click', function () {
      return _this.addIframe();
    });
  };

  _proto2.warmUp = function warmUp() {
    addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
    addPrefetch('preconnect', 'https://www.google.com');
  };

  _proto2.addIframe = function addIframe() {
    var iframeHTML = "\n      <iframe \n        width=\"560\" \n        height=\"315\" \n        frameborder=\"0\" \n        loading=\"lazy\"\n        allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen\n        src=\"" + this.src + "?autoplay=1\">\n      </iframe>";
    this.instance.insertAdjacentHTML('beforeend', iframeHTML);
    this.instance.classList.add('lyt-activated');
  };

  _createClass(Youtube, [{
    key: "videoId",
    get: function get() {
      if (this.src) {
        var youtTubeIDRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
        var matchers = this.src.match(youtTubeIDRegex);
        return matchers && matchers[1] ? matchers[1] : null;
      }

      return null;
    }
  }]);

  return Youtube;
}();

var adapters = {
  youtube: Youtube,
  unknown: Unknown
};

var LiteIframe =
/*#__PURE__*/
function (_HTMLElement) {
  _inheritsLoose(LiteIframe, _HTMLElement);

  function LiteIframe() {
    var _this2;

    _this2 = _HTMLElement.call(this) || this;

    var src = _this2.getAttribute('src');

    var type = _this2.getAttribute('type') || 'unknown';
    var adapter = adapters[type];
    _this2.controller = new adapter(_assertThisInitialized(_this2), src || '');
    return _this2;
  }

  var _proto3 = LiteIframe.prototype;

  _proto3.connectedCallback = function connectedCallback() {
    this.controller.connectedCallback();
  };

  _proto3.warmConnections = function warmConnections() {
    if (this.controller.preconnected) return;
    this.controller.warmUp();
    this.controller.preconnected = true;
  };

  return LiteIframe;
}(
/*#__PURE__*/
_wrapNativeSuper(HTMLElement));

customElements.define('lite-iframe', LiteIframe);
//# sourceMappingURL=mylib.cjs.development.js.map
