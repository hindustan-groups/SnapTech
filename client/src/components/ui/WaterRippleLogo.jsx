import { useEffect, useRef, useState, useCallback } from 'react'
import { Sparkles, Waves } from 'lucide-react'
import snaptechLogoWhite from '@/assets/snaptech-logo-white.png'

/**
 * WaterRippleLogo — Interactive GPU-accelerated Liquid Water Ripple Logo Row.
 * Sits right above the footer with a large prominent Snaptech brand logo.
 * When the user moves or drags their mouse across the logo, realistic water
 * ripples and fluid refraction distort the logo like touching a crystal-clear pool of water.
 */
export default function WaterRippleLogo() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const glRef = useRef(null)
  const programRef = useRef(null)
  const textureRef = useRef(null)
  const animFrameIdRef = useRef(null)

  // Simulation state
  const ripplesRef = useRef([]) // array of { x, y, startTime, intensity }
  const lastMousePosRef = useRef({ x: 0, y: 0, time: 0 })
  const isDraggingRef = useRef(false)
  const [, setIsInteracting] = useState(false)
  const [webglSupported, setWebglSupported] = useState(true)

  // Add a ripple disturbance
  const addRipple = useCallback((normX, normY, intensity = 1.0) => {
    const now = performance.now() / 1000
    const ripples = ripplesRef.current

    // Keep up to 32 active ripples, recycle oldest or expired
    if (ripples.length >= 32) {
      ripples.shift()
    }
    ripples.push({
      x: normX,
      y: normY,
      startTime: now,
      intensity: Math.min(2.5, intensity),
    })
    setIsInteracting(true)
  }, [])

  // Setup WebGL
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    }) || canvas.getContext('experimental-webgl')

    if (!gl) {
      setWebglSupported(false)
      return
    }
    glRef.current = gl

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader with multi-harmonic water ripple physics and caustic reflections
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_texture;
      uniform vec2 u_resolution;
      uniform float u_time;
      
      #define MAX_RIPPLES 32
      uniform vec4 u_ripples[MAX_RIPPLES];
      uniform int u_rippleCount;
      uniform float u_aspect;

      void main() {
        vec2 uv = v_uv;
        vec2 aspectScale = vec2(u_aspect, 1.0);

        vec2 totalDisp = vec2(0.0);
        float totalHeight = 0.0;

        // 1. Ambient gentle underwater fluid currents
        float t = u_time * 0.9;
        vec2 p = uv * aspectScale * 3.5;
        vec2 ambientDisp = vec2(
          sin(p.y * 2.4 + t) * 0.0022 + cos(p.x * 1.8 - t * 0.7) * 0.0015,
          cos(p.x * 2.2 + t * 0.9) * 0.0022 + sin(p.y * 2.0 - t * 0.6) * 0.0015
        );
        totalDisp += ambientDisp;

        // 2. Interactive multi-harmonic water ripples
        for (int i = 0; i < MAX_RIPPLES; i++) {
          if (i >= u_rippleCount) break;
          vec4 rip = u_ripples[i];
          float age = u_time - rip.z;
          if (age < 0.0 || age > 3.0) continue;

          vec2 diff = (uv - rip.xy) * aspectScale;
          float dist = length(diff);

          float waveSpeed = 0.82;
          float waveRadius = age * waveSpeed;
          float delta = dist - waveRadius;

          // Harmonic multi-ring water wave profile (creates realistic concentric ripples)
          float waveWidth = 0.14 + age * 0.06;
          if (abs(delta) < waveWidth && dist > 0.0002) {
            float phase = (delta / waveWidth) * 3.14159265;
            // 3-crest harmonic water wave
            float waveAmp = cos(phase * 2.0) * cos(phase);

            // Natural liquid exponential decay over time and distance
            float decay = exp(-age * 1.45) * exp(-dist * 1.2) * rip.w;
            float h = waveAmp * decay;

            vec2 normDir = diff / max(dist, 0.001);
            totalDisp += normDir * h * 0.065;
            totalHeight += h;
          }
        }

        // Refracted texture sampling with boundary clamp
        vec2 sampleUV = uv + totalDisp;
        sampleUV = clamp(sampleUV, 0.002, 0.998);

        vec4 color = texture2D(u_texture, sampleUV);

        // Water surface light reflection & glistening caustics
        vec3 lightDir = normalize(vec3(0.25, -0.65, 0.7));
        vec3 normal = normalize(vec3(-totalDisp.x * 15.0, -totalDisp.y * 15.0, 1.0));
        float spec = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);

        vec3 waterBlue = vec3(0.1, 0.6, 1.0);
        vec3 caustics = (waterBlue * totalHeight * 0.45) + (vec3(1.0, 1.0, 1.0) * spec * 0.6);

        // Composite logo with shimmering water reflections
        vec3 finalColor = color.rgb + caustics * (color.a > 0.05 ? 1.0 : 0.5);
        float alpha = max(color.a, abs(totalHeight) * 0.45);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `

    function createShader(type, source) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader) // shader compile failed – logged via getShaderInfoLog
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // program link failed – gl.getProgramInfoLog(program)
      return
    }
    programRef.current = program
    gl.useProgram(program)

    // Setup full-screen quad
    const quadBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    )

    const posAttr = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    // Load texture
    const texture = gl.createTexture()
    textureRef.current = texture
    const logoImg = new Image()
    logoImg.src = snaptechLogoWhite
    logoImg.onload = () => {
      // Draw logo into an offscreen canvas to center it nicely with proper padding
      const offCanvas = document.createElement('canvas')
      const targetW = 2048
      const targetH = 800
      offCanvas.width = targetW
      offCanvas.height = targetH
      const ctx = offCanvas.getContext('2d')
      ctx.clearRect(0, 0, targetW, targetH)

      // Calculate size to center logo prominently ("bedha")
      const logoAspect = logoImg.width / logoImg.height
      const maxDrawW = targetW * 0.72 // 72% of width for big presence
      const drawW = maxDrawW
      const drawH = drawW / logoAspect
      const drawX = (targetW - drawW) / 2
      const drawY = (targetH - drawH) / 2

      ctx.drawImage(logoImg, drawX, drawY, drawW, drawH)

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offCanvas)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }

    // Enable blending for transparency
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // Resize canvas
    function handleResize() {
      if (!canvas || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Render loop
    const startTime = performance.now() / 1000
    function render() {
      const now = performance.now() / 1000
      const elapsed = now - startTime

      gl.clearColor(0.0, 0.0, 0.0, 0.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      // Set uniforms
      const resLoc = gl.getUniformLocation(program, 'u_resolution')
      gl.uniform2f(resLoc, canvas.width, canvas.height)

      const aspectLoc = gl.getUniformLocation(program, 'u_aspect')
      gl.uniform1f(aspectLoc, canvas.width / Math.max(canvas.height, 1))

      const timeLoc = gl.getUniformLocation(program, 'u_time')
      gl.uniform1f(timeLoc, elapsed)

      // Pass active ripples
      const ripples = ripplesRef.current
      const rippleData = new Float32Array(32 * 4)
      let activeCount = 0

      for (let i = 0; i < ripples.length && i < 32; i++) {
        const r = ripples[i]
        const age = now - r.startTime
        if (age < 2.8) {
          rippleData[i * 4] = r.x
          rippleData[i * 4 + 1] = r.y
          rippleData[i * 4 + 2] = r.startTime - startTime
          rippleData[i * 4 + 3] = r.intensity
          activeCount = i + 1
        }
      }

      const ripplesLoc = gl.getUniformLocation(program, 'u_ripples')
      gl.uniform4fv(ripplesLoc, rippleData)

      const countLoc = gl.getUniformLocation(program, 'u_rippleCount')
      gl.uniform1i(countLoc, activeCount)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animFrameIdRef.current = requestAnimationFrame(render)
    }

    animFrameIdRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
    }
  }, [])

  // Mouse & Touch Interaction Handlers
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const normX = (e.clientX - rect.left) / rect.width
    const normY = (e.clientY - rect.top) / rect.height

    if (normX < -0.05 || normX > 1.05 || normY < -0.05 || normY > 1.05) return
    const clampedX = Math.max(0.01, Math.min(0.99, normX))
    const clampedY = Math.max(0.01, Math.min(0.99, normY))

    const now = performance.now()
    const last = lastMousePosRef.current
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    const dt = Math.max(now - last.time, 1)
    const speed = Math.sqrt(dx * dx + dy * dy) / dt

    // Fluid water ripple wake
    if (now - last.time > 25 || speed > 0.4) {
      const intensity = isDraggingRef.current
        ? Math.min(3.2, 1.4 + speed * 1.8)
        : Math.min(2.4, 0.9 + speed * 1.1)

      addRipple(clampedX, clampedY, intensity)
      lastMousePosRef.current = { x: e.clientX, y: e.clientY, time: now }
    }
  }

  const handlePointerDown = (e) => {
    isDraggingRef.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const normX = Math.max(0.01, Math.min(0.99, (e.clientX - rect.left) / rect.width))
    const normY = Math.max(0.01, Math.min(0.99, (e.clientY - rect.top) / rect.height))

    // High energy droplet splash on click/tap
    addRipple(normX, normY, 2.8)
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  // Periodic subtle ambient droplet when idle to feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return
      // Subtle droplet in center area
      const rx = 0.35 + Math.random() * 0.3
      const ry = 0.4 + Math.random() * 0.2
      addRipple(rx, ry, 0.65)
    }, 3800)

    return () => clearInterval(interval)
  }, [addRipple])

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-linear-to-b from-[#03091e] via-[#020714] to-[#01040d] border-t border-blue-500/20 select-none py-12 sm:py-16 lg:py-20"
      aria-label="Snaptech Interactive Brand Water Surface"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background ambient water glow & subtle caustic rays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep blue liquid radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 sm:w-225 h-87.5 bg-linear-to-r from-blue-600/15 via-cyan-500/20 to-blue-600/15 blur-[120px] rounded-full" />
        {/* Subtle digital water grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b6ef308_1px,transparent_1px),linear-gradient(to_bottom,#1b6ef308_1px,transparent_1px)] bg-size-[3rem_3rem]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Interactive Cue / Brand Tag */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[11px] font-mono font-semibold text-blue-300 tracking-wider uppercase">
            <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Interactive Fluid Canvas</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Move or drag mouse over logo to create ripples</span>
          </div>
        </div>

        {/* The Big Canvas for the Water Ripple Logo */}
        <div className="relative w-full h-45 sm:h-65 md:h-80 lg:h-95 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/5 bg-slate-950/40 backdrop-blur-sm shadow-2xl shadow-blue-950/50 group">
          {webglSupported ? (
            <canvas
              ref={canvasRef}
              className="w-full h-full block touch-none"
              style={{ display: 'block' }}
            />
          ) : (
            /* Fallback in case WebGL is disabled */
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={snaptechLogoWhite}
                alt="Snaptech Logo"
                className="max-h-[60%] w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          {/* Liquid Surface Water Reflections Overlay Effect */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-transparent via-cyan-400/2 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Corner Focus Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />
        </div>

        {/* Bottom Micro Caption */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
          <span>// SNAPTECH LIQUID DYNAMICS</span>
          <span className="sm:hidden text-cyan-400 font-semibold">Touch &amp; drag to ripple</span>
          <span className="hidden sm:inline">60 FPS REAL-TIME FLUID SIMULATION</span>
        </div>
      </div>
    </section>
  )
}
