var L;
(function (L) {
    class StrelkaMarker extends L.CircleMarker {
        _loadImage(name) {
            const iconClassName = name || this.options.iconClassName;
            if (ImageCache[iconClassName])
                return;
            ImageCache[iconClassName] = new Image(18, 18);
            const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" fill="none"><path fill="red" stroke="#fff" stroke-width="1.3" d="M13 9.7h1.2l-.7-1-4-6-.5-.9-.5.8-4 6-.7 1h3.5v8h3.5V9.8H13Z" /></svg >`;
            let blob = new Blob([svgIcon], { type: "image/svg+xml" });
            ImageCache[iconClassName].src = URL.createObjectURL(blob);
            ImageCache[iconClassName].onload = function () {
                URL.revokeObjectURL(ImageCache[iconClassName].src);
            };
        }
        onAdd(map) {
            super.onAdd(map);
            this._loadImage();
            this._map = map;
            return this;
        }
        _updatePath() {
            if (!this._map)
                return;
            if (!this._renderer._bounds.intersects(this._pxBounds))
                return;
            const iconClassName = this.options.iconClassName;
            const icon = ImageCache[iconClassName];
            if (!icon)
                return;
            const zoom = this._map.getZoom();
            const p = this._point.round();
            if (!this._renderer._bounds.intersects(this._pxBounds))
                return;
            this._renderer._ctx.save();
            this._renderer._ctx.translate(p.x, p.y);
            const color = this._map.options.baseLayerTheme === 'dark' ? 'white' : 'black';
            const shadowColor = this._map.options.baseLayerTheme === 'dark' ? 'black' : 'white';
            if (zoom >= 14) {
                let text = zoom < 17
                    ? this.feature.properties.number
                    : `${this.feature.properties.number} '${this.feature.properties.text}'`;
                this._renderer._ctx.fillStyle = color;
                this._renderer._ctx.fillText(text, icon.width / 2, 4);
            }
            const degrees = this.feature.properties.degrees;
            if (degrees != null) {
                this._renderer._ctx.rotate(degrees * Math.PI / 180);
                this._renderer._ctx.drawImage(icon, -icon.width / 2, -icon.height / 2, icon.width, icon.height);
            }
            else {
                const tmpRotate = 90 * Math.PI / 180;
                this._renderer._ctx.rotate(tmpRotate);
                this._renderer._ctx.drawImage(icon, -icon.width / 2, -icon.height / 2, icon.width, icon.height);
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
    L.StrelkaMarker = StrelkaMarker;
    function strelkaMarker(latlng, options) {
        return new L.StrelkaMarker(latlng, options);
    }
    L.strelkaMarker = strelkaMarker;
    class StrelkiLayer extends L.GeoJsonLayer {
        constructor(url, options) {
            options = Object.assign({
                refreshIntervalSeconds: 60 * 30,
                icons: ['gis-strelka-icon']
            }, options);
            super(url, options);
        }
        afterInit(map) {
            const icons = this.options.icons;
            for (let i = 0; i < icons.length; i++) {
                L.strelkaMarker()._loadImage(icons[i]);
            }
        }
        pointToLayer(feature, latlng) {
            const marker = L.strelkaMarker(latlng, {
                iconClassName: 'gis-strelka-icon'
            });
            marker.on('click', function (e) {
                const hyperlink = e.sourceTarget.feature.properties.hyperlink;
                map.fire("gis:dialog:show", new Gis.IframeDialog(hyperlink, e.sourceTarget));
            });
            marker.on('mouseover', function (e) {
                L.DomEvent.stop(e);
                map.fire('gis:tooltip', {
                    message: `${feature.properties.number} ${feature.properties.text}`,
                    sourceTarget: marker
                });
            });
            return marker;
        }
    }
    L.StrelkiLayer = StrelkiLayer;
    function strelkiLayer(url, options) {
        return new L.StrelkiLayer(url, options);
    }
    L.strelkiLayer = strelkiLayer;
})(L || (L = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyZWxraUxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU3RyZWxraUxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsQ0FBQyxDQXVIVjtBQXZIRCxXQUFVLENBQUM7SUFJUCxNQUFhLGFBQWMsU0FBUSxDQUFDLENBQUMsWUFBWTtRQUs3QyxVQUFVLENBQUMsSUFBYTtZQUNwQixNQUFNLGFBQWEsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDekQsSUFBRyxVQUFVLENBQUMsYUFBYSxDQUFDO2dCQUFFLE9BQU87WUFFckMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQztZQUM3QyxNQUFNLE9BQU8sR0FBRyx3TUFBd00sQ0FBQztZQUN6TixJQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDMUQsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUc7Z0JBQy9CLEdBQUcsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQztRQUNOLENBQUM7UUFDUSxLQUFLLENBQUMsR0FBVTtZQUNyQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNoQixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsV0FBVztZQUNQLElBQUcsQ0FBQyxJQUFJLENB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