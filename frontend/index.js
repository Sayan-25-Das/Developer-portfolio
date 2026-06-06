/* ============================
   ANIMATED WAVE BACKGROUND
   Smooth multi-layered gradient waves
   ============================ */

(function () {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = 300;
    }
    resize();
    window.addEventListener('resize', resize);

    // Wave layers — each with its own gradient, shape, and motion
    const waveLayers = [
        {
            // Deep base wave — slow, wide
            amplitudes: [35, 15, 8],
            frequencies: [0.003, 0.006, 0.01],
            speeds:     [0.4, 0.6, 0.9],
            phase: 0,
            yOffset: 0.2,
            gradient: ['rgba(123, 44, 255, 0.15)', 'rgba(0, 247, 255, 0.05)']
        },
        {
            // Mid wave — medium speed, organic feel
            amplitudes: [28, 12, 6],
            frequencies: [0.004, 0.009, 0.015],
            speeds:     [0.6, 0.85, 1.2],
            phase: 1.5,
            yOffset: 0.35,
            gradient: ['rgba(0, 247, 255, 0.14)', 'rgba(0, 255, 166, 0.04)']
        },
        {
            // Upper wave — faster, ripple effect
            amplitudes: [20, 10, 5],
            frequencies: [0.005, 0.012, 0.02],
            speeds:     [0.85, 1.1, 1.5],
            phase: 3.2,
            yOffset: 0.5,
            gradient: ['rgba(0, 255, 166, 0.12)', 'rgba(123, 44, 255, 0.03)']
        },
        {
            // Top shimmer — fast subtle ripples
            amplitudes: [12, 7, 3],
            frequencies: [0.007, 0.016, 0.025],
            speeds:     [1.2, 1.6, 2.0],
            phase: 5.0,
            yOffset: 0.6,
            gradient: ['rgba(0, 247, 255, 0.08)', 'rgba(255, 64, 129, 0.03)']
        },
        {
            // Accent wave — pink tint, slow drift
            amplitudes: [22, 9, 4],
            frequencies: [0.0035, 0.008, 0.014],
            speeds:     [0.5, 0.75, 1.0],
            phase: 2.1,
            yOffset: 0.42,
            gradient: ['rgba(255, 64, 129, 0.08)', 'rgba(123, 44, 255, 0.04)']
        }
    ];

    function drawWave(layer, time) {
        const w = canvas.width;
        const h = canvas.height;
        const baseY = h * layer.yOffset;

        // Build the wave path
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 2) {
            let y = baseY;
            // Sum multiple sine harmonics for organic, smooth shape
            for (let i = 0; i < layer.amplitudes.length; i++) {
                y += Math.sin(
                    x * layer.frequencies[i] + layer.phase + time * layer.speeds[i] * 0.001
                ) * layer.amplitudes[i];
            }
            ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        // Create vertical gradient fill
        const grad = ctx.createLinearGradient(0, baseY - 40, 0, h);
        grad.addColorStop(0, layer.gradient[0]);
        grad.addColorStop(1, layer.gradient[1]);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    let startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw each wave layer (back to front)
        for (const layer of waveLayers) {
            drawWave(layer, elapsed);
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();
