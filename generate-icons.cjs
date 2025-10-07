const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);

    // Gold circle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Music note
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', size/2, size/2);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`public/icons/icon-${size}x${size}.png`, buffer);
    console.log(`Generated icon-${size}x${size}.png`);
});

console.log('All icons generated successfully!');
