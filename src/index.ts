interface ControllerInterface {
  connectedCallback(): void;
  warmUp(): void;
  addIframe(): void;
}

interface Adapters {
  youtube: typeof Youtube;
  unknown: typeof Unknown;
}

type None = null;
type Maybe<T> = T | None;
type ValueOf<O> = O[keyof O];

type AdapterKeys = keyof Adapters;
type Adapter = InstanceType<ValueOf<Adapters>>;

type PrefetchKind = 'prefetch' | 'preload' | 'preconnect';
type PrefetchAs = 'image' | 'style' | 'frame' | 'iframe' | 'fetch';

function addPrefetch(
  kind: PrefetchKind,
  url: string,
  as: Maybe<PrefetchAs> = null
) {
  const linkElem = document.createElement('link');
  linkElem.rel = kind;
  linkElem.href = url;
  if (as) {
    linkElem.as = as;
  }
  linkElem.crossOrigin = 'true';
  document.head.append(linkElem);
}

// Forked from https://github.com/paulirish/lite-youtube-embed/
const css = `
lite-iframe {
  background-color: var(--lite-iframe-bg, #1f1e1e);
  position: relative;
  display: block;
  contain: content;
  background-position: center center;
  background-size: cover;
  cursor: pointer;
  border-radius: 4px;
}

lite-iframe::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  background-image: url("data:image/gif;base64,R0lGODlhAQABAIABAEdJRgAAACwAAAAAAQABAAACAkQBAA==");
  background-position: top;
  background-repeat: repeat-x;
  height: 60px;
  padding-bottom: 50px;
  width: 100%;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

/* responsive iframe with a 16:9 aspect ratio
    thanks https://css-tricks.com/responsive-iframes/
*/
lite-iframe::after {
  content: "";
  display: block;
  padding-bottom: calc(100% / (16 / 9));
}

lite-iframe .root {
  color: #a2a2a2;
  font-size: 14px;
  line-height: 1.5;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
}

lite-iframe iframe {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

lite-iframe > .lty-playbtn {
  width: 68px;
  height: 48px;
  position: absolute;
  transform: translate3d(-50%, -50%, 0);
  top: 50%;
  left: 50%;
  z-index: 1;
  /* YT's actual play button svg */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 68 48"><path fill="%23f00" fill-opacity="0.8" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"></path><path d="M 45,24 27,14 27,34" fill="%23fff"></path></svg>');
  filter: grayscale(100%);
  transition: filter 0.1s cubic-bezier(0, 0, 0.2, 1);
}

lite-iframe:hover > .lty-playbtn {
  filter: none;
}

/* Post-click styles */
lite-iframe.lyt-activated {
  cursor: unset;
}

lite-iframe.lyt-activated > .lty-playbtn,
lite-iframe.lyt-activated::before {
  opacity: 0;
  pointer-events: none;
}
`;

class Unknown implements ControllerInterface {
  public preconnected: boolean;
  private src: Maybe<string>;
  private instance: LiteIframe;
  private io: Maybe<IntersectionObserver> = null;

  constructor(instance: LiteIframe, src: string) {
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

  public connectedCallback() {
    if (this.io) {
      this.io.observe(this.instance);
    }
  }

  private handleIntersection(data: any) {
    if (data[0].isIntersecting) {
      this.handleIframe();
      this.cleanup();
    }
  }

  private handleIframe() {
    this.addIframe();
  }

  private cleanup() {
    if (this.io) {
      this.io.disconnect();
    }
  }

  public warmUp() {
    if (this.src) addPrefetch('preload', this.src, 'iframe');
  }

  public addIframe() {
    let attributes = this.instance.elementIframeAttributes;
    let attributesString = attributes
      .map(attribute => `${attribute.name}="${attribute.value}"`)
      .join('\n');

    const iframeHTML = `
      <iframe 
        ${attributesString}
      </iframe>`;

    this.instance.querySelector('.root')!.innerHTML = iframeHTML;
  }
}

// Forked from https://github.com/paulirish/lite-youtube-embed/
class Youtube implements ControllerInterface {
  public preconnected: boolean;
  private src: Maybe<string>;
  private instance: LiteIframe;
  private posterUrl: string;

  public constructor(instance: LiteIframe, src: string) {
    this.preconnected = false;

    this.instance = instance;
    this.src = src;

    this.warmUp = this.warmUp.bind(this);
    this.addIframe = this.addIframe.bind(this);

    this.posterUrl = `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
    addPrefetch('preload', this.posterUrl, 'image');
  }

  public connectedCallback() {
    this.instance.style.backgroundImage = `url("${this.posterUrl}")`;

    const playBtn = document.createElement('div');
    playBtn.classList.add('lty-playbtn');
    this.instance.append(playBtn);

    this.instance.addEventListener('pointerover', this.warmUp, {
      once: true,
    });

    this.instance.addEventListener('click', () => this.addIframe());
  }

  public warmUp() {
    addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
    addPrefetch('preconnect', 'https://www.google.com');
  }

  public addIframe() {
    let attributes = this.instance.elementIframeAttributes.slice();

    // Force autoplay
    attributes.find(attribute => {
      if (attribute.name == 'src') {
        attribute.value += '?autoplay=1';
      }
    });

    let attributesString = attributes
      .map(attribute => `${attribute.name}="${attribute.value}"`)
      .join('\n');

    const iframeHTML = `
        <iframe 
          ${attributesString}
        </iframe>`;

    this.instance.querySelector('.root')!.innerHTML = iframeHTML;
    this.instance.classList.add('lyt-activated');
  }

  private get videoId() {
    if (this.src) {
      let youtTubeIDRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
      let matchers = this.src.match(youtTubeIDRegex);
      return matchers && matchers[1] ? matchers[1] : null;
    }

    return null;
  }
}

const adapters: Adapters = {
  youtube: Youtube,
  unknown: Unknown,
};

class LiteIframe extends HTMLElement {
  private controller: Adapter;
  private src: Maybe<string>;
  private type: Maybe<AdapterKeys>;

  constructor() {
    super();

    this.src = this.getAttribute('src');
    this.type = (this.getAttribute('type') || 'unknown') as AdapterKeys;
    let adapter = adapters[this.type];

    this.controller = new adapter(this, this.src || '');
  }

  get elementIframeAttributes() {
    let attributes = Array.from(this.attributes);
    let BLACKLIST = ['style', 'width', 'height'];

    // Force loading attribute to be lazy
    let loading = document.createAttribute('loading');
    loading.value = 'lazy';
    attributes.push(loading);

    attributes = attributes.filter(
      attribute => !BLACKLIST.includes(attribute.name)
    );

    return attributes;
  }

  connectedCallback() {
    this.insertAdjacentHTML(
      'afterbegin',
      `<style>${css}</style><div class="root">Loading ${this.src}</div>`
    );

    this.controller.connectedCallback();
  }

  public warmConnections() {
    if (this.controller.preconnected) return;

    this.controller.warmUp();
    this.controller.preconnected = true;
  }
}

customElements.define('lite-iframe', LiteIframe);
