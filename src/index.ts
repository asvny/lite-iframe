interface ControllerInterface {
  connectedCallback(): void;
  warmUp(): void;
  addIframe(): void;
}

interface Adapters {
  youtube: typeof Youtube;
  unknown: typeof Unknown;
}

type None = void;
type Maybe<T> = T | None;

type AdapterKeys = keyof Adapters;
type AdapterClass = typeof Youtube | typeof Unknown;
type Adapter = Youtube | Unknown;

type PrefetchKind = 'prefetch' | 'preload' | 'preconnect';
type PrefetchAs = 'image' | 'style' | 'frame' | 'iframe' | 'fetch';

function addPrefetch(kind: PrefetchKind, url: string, as: Maybe<PrefetchAs>) {
  const linkElem = document.createElement('link');
  linkElem.rel = kind;
  linkElem.href = url;
  if (as) {
    linkElem.as = as;
  }
  linkElem.crossOrigin = 'true';
  document.head.append(linkElem);
}

class Unknown implements ControllerInterface {
  public preconnected: boolean;
  private src: Maybe<string>;
  private instance: LiteIframe;
  private io: Maybe<IntersectionObserver>;

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
    const iframeHTML = `
      <iframe 
        width="100%" 
        height="100%" 
        frameborder="0" 
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        src="${this.src}">
      </iframe>`;

    this.instance.insertAdjacentHTML('beforeend', iframeHTML);
  }
}

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
    const iframeHTML = `
      <iframe 
        width="100%" 
        height="100%" 
        frameborder="0" 
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        src="${this.src}?autoplay=1">
      </iframe>`;

    this.instance.insertAdjacentHTML('beforeend', iframeHTML);
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
  constructor() {
    super();

    let src = this.getAttribute('src');
    let type = this.getAttribute('type') || 'unknown';
    let adapter = adapters[type as AdapterKeys];

    this.controller = new adapter(this, src || '');
  }

  connectedCallback() {
    this.controller.connectedCallback();
  }

  public warmConnections() {
    if (this.controller.preconnected) return;

    this.controller.warmUp();
    this.controller.preconnected = true;
  }
}

customElements.define('lite-iframe', LiteIframe);
