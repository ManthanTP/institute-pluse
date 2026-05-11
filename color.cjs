const Jimp = require('jimp');

async function getDominantColor(imagePath) {
    try {
        const image = await Jimp.read(imagePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const color = Jimp.intToRGBA(image.getPixelColor(x, y));
                if (color.a > 10) { // ignore transparent
                    r += color.r;
                    g += color.g;
                    b += color.b;
                    count++;
                }
            }
        }
        
        if (count === 0) return [0,0,0];
        
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        
        console.log(`RGB(${r}, ${g}, ${b})`);
        console.log(`HEX: #${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
    } catch (err) {
        console.error("Error:", err);
    }
}

getDominantColor('./public/logo.png');
