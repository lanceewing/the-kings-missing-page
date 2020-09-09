class Util {

    /**
     * Whether the Twemoji font is active or not.
     */
    static twemoji = false;

    /**
     * Renders the given emoji text at that given font size on a canvas. Returns that canvas.
     * 
     * @param {string} emojiText The emoji text to render.
     * @param {number} width The desired width of the canvas.
     * @param {number} height The desired height of the canvas.
     * @param {boolean} flip True to horizontally flip the image; otherwise false.
     * 
     * @returns The created canvas with the rendered emoji text at the given font size.
     */
    static renderEmoji(emojiText, width, height, flip=false, fill=true) {
        let size = Math.max(width, height);
        let canvas = document.createElement('canvas');
        canvas.height = size + (size / 8) + 20;
        canvas.width = size * 1.4 + 10;
        let ctx = canvas.getContext('2d');
        //ctx.font = `${size}px ${Util.twemoji? 'twemoji' : 'Segoe UI Emoji'}`;
        // TODO: We could try once to render at actual size, then fall back on 250px.
        ctx.font = `${!Util.twemoji || size < 250? size : 250}px ${Util.twemoji? 'twemoji' : 'Segoe UI Emoji'}`;
        ctx.textBaseline = 'bottom';
        if (fill) ctx.fillStyle = 'red';
        ctx.fillText(emojiText, 5, canvas.height - 5);

        // On Windows, this reduces the thick black edges.
        let [minX, minY, maxX, maxY] = Util.reduceEdges(ctx, 0, 0);
        
        // Redraw the canvas, so that we can remove white space and add a shadow.
        let emojiCanvas = document.createElement('canvas');
        let newWidth = ((maxX - minX) + 3);
        let newHeight = ((maxY - minY) + 3);
        emojiCanvas.width = width;
        emojiCanvas.height = height;
        let emojiCtx = emojiCanvas.getContext('2d');
        let exists = false;
        if (newWidth > 0 && newHeight > 0) {
            emojiCtx.shadowColor = "black";
            emojiCtx.shadowBlur = 3;
            if (flip) {
                emojiCtx.translate(width, 0);
                emojiCtx.scale(-1, 1);
            }
            emojiCtx.drawImage(
                canvas,
                minX-1, minY-1, newWidth, newHeight,
                0, 0, width, height,
            );
            exists = true;
        }

        return [ emojiCanvas, emojiCtx.getImageData(0, 0, width, height), exists ];
    }

    /**
     * For the image data in the given canvas context, applies a fill algorithm
     * to trim off the thick black edges that Windows emojis have around them.
     * On other operating systems, this will hopefully do nothing, but lets 
     * see.
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} startX 
     * @param {number} startY 
     */
    static reduceEdges(ctx, startX, startY) {
        let { width, height } = ctx.canvas;
        let dataWidth = (width << 2);
        let imgData = ctx.getImageData(0, 0, width, height);
        let visitMap = new Uint32Array(imgData.data.length);
        let queue = [[startX, startY]];
        let [minX, minY] = [width, height];
        let maxX = 0;
        let maxY = 0;

        while (queue.length) {
            // Get pixel position to test from queue.
            let [x, y] = queue.shift();
            let pos = ((y * dataWidth) + (x << 2));

            // Check if we've been here before.
            if (visitMap[pos]) continue;

            visitMap[pos] = 1;

            let [red, green, blue, alpha] = imgData.data.slice(pos, pos + 4);
            let brightness = Math.round(Math.sqrt((red * red * 0.241) + (green * green * 0.691) + (blue * blue * 0.068)));
            let spread = false;

            if (alpha == 0) {
                spread = true;
            }
            else if ((red == 0) && (green == 0) && (blue == 0)) {
                if (Util.WIN) {
                    imgData.data[pos + 3] = 0;
                    spread = true;
                }
            }
            else if (brightness < 70) {
                if (Util.WIN) {
                    imgData.data[pos + 3] = Math.round(brightness * (255 / 70));
                    spread = true;
                }
            }

            if (spread) {
                if (x > 0) queue.push([x - 1, y]);
                if (x < width - 1) queue.push([x + 1, y]);
                if (y > 0) queue.push([x, y - 1]);
                if (y < height - 1) queue.push([x, y + 1]);
            }

            if (imgData.data[pos + 3]) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        return [minX, minY, maxX, maxY];
    }

    /**
     * Detects what Emoji Unicode version is available by default.
     */
    static detectEmojiVersion() {
        // These chars are from different Unicode version, starting at 6.
        //let unicodeVersion = [...'🐄🙂🧀🥕🧛🧪🪓🛖'].reduce((a, c) =>  a + (Util.renderEmoji(c, 50, 50, 0, 0)[2]? 1 : 0), 5);
        //if (Util.twemoji = unicodeVersion < 13) document.body.classList.add('twemoji');
        if (Util.twemoji = !Util.renderEmoji('🩸', 100, 100, 0, 0)[2]) document.body.classList.add('twemoji');
        Util.WIN = navigator.platform.indexOf('Win') > -1;
    }
}

Util.detectEmojiVersion();
