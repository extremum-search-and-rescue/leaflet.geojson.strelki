namespace L { 
    export interface StrelkaMarkerOptions extends L.CircleMarkerOptions {
        iconClassName: string;
    }
    export class StrelkaMarker extends L.CircleMarker {
        override options: L.StrelkaMarkerOptions;
        private _renderer: L.Canvas
        private _pxBounds: BoundsExpression;
        _point: any;
        _loadImage(name?: string){
            const iconClassName = name || this.options.iconClassName;
            if(ImageCache[iconClassName]) return;

            ImageCache[iconClassName] = new Image(18,18);
            const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" fill="none"><path fill="red" stroke="#fff" stroke-width="1.3" d="M13 9.7h1.2l-.7-1-4-6-.5-.9-.5.8-4 6-.7 1h3.5v8h3.5V9.8H13Z" /></svg >`;
            let blob = new Blob([svgIcon], { type: "image/svg+xml" });
            ImageCache[iconClassName].src = URL.createObjectURL(blob);
            ImageCache[iconClassName].onload = function() {
                URL.revokeObjectURL(ImageCache[iconClassName].src);
            };
        }
        override onAdd(map: L.Map): this {
            super.onAdd(map);
            this._loadImage();
            this._map = map;
            return this;
        }

        _updatePath () {
            if(!this._map) return;
            if(!this._renderer._bounds.intersects(this._pxBounds)) return;
        
            const iconClassName = this.options.iconClassName;
            const icon = ImageCache[iconClassName];
            if(!icon) return;
       
            const zoom = this._map.getZoom();
            const p = this._point.round();
            if(!this._renderer._bounds.intersects(this._pxBounds)) return;

            this._renderer._ctx.save();
            this._renderer._ctx.translate(p.x, p.y);
            const color = this._map.options.baseLayerTheme === 'dark' ? 'white' : 'black';
            const shadowColor = this._map.options.baseLayerTheme === 'dark' ? 'black' : 'white';

            if(zoom>=14){
                let text = zoom<17 
                ? this.feature.properties.number 
                : `${this.feature.properties.number} '${this.feature.properties.text}'`;
                this._renderer._ctx.fillStyle = color;
                this._renderer._ctx.fillText(text,icon.width/2, 4);
            }
            const degrees = this.feature.properties.degrees;

            if (degrees != null) {
                this._renderer._ctx.rotate(degrees * Math.PI / 180);
                this._renderer._ctx.drawImage(icon, - icon.width / 2, - icon.height / 2, icon.width, icon.height);
            }
            else {
                const tmpRotate = 90 * Math.PI / 180;
                this._renderer._ctx.rotate(tmpRotate);
                this._renderer._ctx.drawImage(icon, - icon.width / 2, - icon.height / 2, icon.width, icon.height);
                this._renderer._ctx.rotate(-tmpRotate);
                this._renderer._ctx.font = '24px bold';
                this._renderer._ctx.shadowColor = shadowColor;
                this._renderer._ctx.shadowOffsetX = 0;
                this._renderer._ctx.shadowOffsetY = 0;
                this._renderer._ctx.shadowBlur = 4;
                this._renderer._ctx.fillStyle = color;
                this._renderer._ctx.fillText('?', -6, 8);
            }
            this._renderer._ctx.restore();
      
        }
    }
    export function strelkaMarker(latlng?: L.LatLng, options?: L.StrelkaMarkerOptions) {
        return new L.StrelkaMarker(latlng, options);
    }

    export class StrelkiLayer extends L.GeoJsonLayer {
        constructor(url: string, options?: L.GeoJsonLayerOptions) {
            options = {... {
                    refreshIntervalSeconds: 60 * 30,
                    icons: ['gis-strelka-icon']
                }, ...options};
            super(url, options)
        }
        
        override afterInit(map: L.Map)
        {
            const icons = this.options.icons;
            for(let i = 0; i<icons.length;i++) {
                L.strelkaMarker()._loadImage(icons[i]);
            }
        }
        pointToLayer (feature: GeoJSON.Feature<GeoJSON.Point,any>, latlng: L.LatLng) {
            const marker = L.strelkaMarker(latlng, {iconClassName: 'gis-strelka-icon'});
            marker.on('click', function (e: LeafletMouseEvent) {
                const hyperlink = e.sourceTarget.feature.properties.hyperlink;
                map.fire("gis:dialog:show", new Gis.IframeDialog(hyperlink, e.sourceTarget));
            });
            marker.on('mouseover', function (e) {
                L.DomEvent.stop(e);
                    map.fire('gis:tooltip', { 
                        message: `${feature.properties.number} ${feature.properties.text}`, 
                        sourceTarget: marker
                })
            });
            return marker;
        }
    }

    export function strelkiLayer (url: string, options: L.GeoJsonLayerOptions) {
        return new L.StrelkiLayer(url, options);
    }
}