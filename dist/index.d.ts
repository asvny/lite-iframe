interface ControllerInterface {
    connectedCallback(): void;
    warmUp(): void;
    addIframe(): void;
}
interface Adapters {
    youtube: typeof Youtube;
    unknown: typeof Unknown;
}
declare type None = void;
declare type Maybe<T> = T | None;
declare type AdapterKeys = keyof Adapters;
declare type AdapterClass = typeof Youtube | typeof Unknown;
declare type Adapter = Youtube | Unknown;
declare type PrefetchKind = 'prefetch' | 'preload' | 'preconnect';
declare type PrefetchAs = 'image' | 'style' | 'frame' | 'iframe' | 'fetch';
declare function addPrefetch(kind: PrefetchKind, url: string, as: Maybe<PrefetchAs>): void;
declare class Unknown implements ControllerInterface {
    preconnected: boolean;
    private src;
    private instance;
    private io;
    constructor(instance: LiteIframe, src: string);
    connectedCallback(): void;
    private handleIntersection;
    private handleIframe;
    private cleanup;
    warmUp(): void;
    addIframe(): void;
}
declare class Youtube implements ControllerInterface {
    preconnected: boolean;
    private src;
    private instance;
    private posterUrl;
    constructor(instance: LiteIframe, src: string);
    connectedCallback(): void;
    warmUp(): void;
    addIframe(): void;
    private get videoId();
}
declare const adapters: Adapters;
declare class LiteIframe extends HTMLElement {
    private controller;
    constructor();
    connectedCallback(): void;
    warmConnections(): void;
}
