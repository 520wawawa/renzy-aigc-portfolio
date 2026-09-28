import { useEffect, useRef } from 'react'
import './smooth-cursor.css'

export default function SmoothCursor() {
  const canvasRef = useRef(null)
  const iconRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const icon = iconRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    const media = window.matchMedia('(min-width: 768px) and (pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    let lastFrame = 0
    let lastMove = 0
    let points = []
    let target = { x: 0, y: 0 }
    let width = 0
    let height = 0
    let clickTimer = 0

    const scheduleIconHide = (delay = 340) => {
      window.clearTimeout(clickTimer)
      clickTimer = window.setTimeout(hideIcon, delay)
    }

    const setIcon = (variant, event) => {
      if (!icon || !event) return
      if (icon.dataset.variant !== variant) {
        icon.dataset.variant = variant
        icon.firstElementChild.src = `${import.meta.env.BASE_URL}images/cursor/${variant}.png`
      }
      icon.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
      icon.classList.add('is-visible')
      icon.classList.toggle('is-clicking', variant === 'click')
    }

    const hideIcon = () => {
      window.clearTimeout(clickTimer)
      icon?.classList.remove('is-visible', 'is-clicking')
    }

    const stop = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      lastFrame = 0
      points = []
      context.clearRect(0, 0, width, height)
      hideIcon()
    }

    const resize = () => {
      stop()
      width = window.innerWidth
      height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      // Release the backing buffer entirely on touch/reduced-motion layouts.
      canvas.width = media.matches ? Math.round(width * ratio) : 1
      canvas.height = media.matches ? Math.round(height * ratio) : 1
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.lineCap = 'round'
      context.lineJoin = 'round'
    }

    const draw = (now) => {
      frame = 0
      const opacity = Math.max(0, 1 - Math.max(0, now - lastMove - 80) / 320)
      if (document.hidden || !media.matches || !opacity) {
        stop()
        return
      }
      const delta = Math.min(now - (lastFrame || now - 16.67), 32)
      lastFrame = now
      const ease = 1 - Math.exp(-delta / 24)
      context.clearRect(0, 0, width, height)

      for (let index = 0; index < points.length; index++) {
        const previous = index === 0 ? target : points[index - 1]
        points[index].x += (previous.x - points[index].x) * ease
        points[index].y += (previous.y - points[index].y) * ease
      }

      // A fine light edge keeps the red ribbon visible over the red panels.
      for (let index = points.length - 1; index > 0; index--) {
        const taper = 1 - index / points.length
        context.beginPath()
        context.moveTo(points[index].x, points[index].y)
        context.lineTo(points[index - 1].x, points[index - 1].y)
        context.globalAlpha = opacity * taper * 0.35
        context.strokeStyle = '#ffffff'
        context.lineWidth = taper * 5 + 1.5
        context.stroke()
        context.globalAlpha = opacity * taper * 0.85
        context.strokeStyle = '#e52421'
        context.lineWidth = taper * 5
        context.stroke()
      }
      frame = window.requestAnimationFrame(draw)
    }

    const move = (event) => {
      if (!media.matches || document.hidden || event.pointerType !== 'mouse') return
      if (event.target.closest('input, textarea, select, [contenteditable="true"], video[controls]')) {
        stop()
        return
      }
      // Show the directional style as soon as the pointer moves, so the
      // custom cursor is visible without requiring the visitor to hold a click.
      setIcon(event.clientX < target.x ? 'drag-left' : 'drag-right', event)
      if (!event.buttons) scheduleIconHide()
      target = { x: event.clientX, y: event.clientY }
      if (!points.length) points = Array.from({ length: 24 }, () => ({ ...target }))
      lastMove = performance.now()
      if (!frame) frame = window.requestAnimationFrame(draw)
    }
    const down = (event) => {
      if (!media.matches || document.hidden || event.pointerType !== 'mouse') return
      if (event.target.closest('input, textarea, select, [contenteditable="true"], video[controls]')) return
      setIcon('click', event)
      window.clearTimeout(clickTimer)
    }
    const up = () => {
      if (!icon?.classList.contains('is-visible')) return
      window.clearTimeout(clickTimer)
      clickTimer = window.setTimeout(hideIcon, 520)
    }
    const leave = (event) => { if (!event.relatedTarget) stop() }

    resize()
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointerout', leave)
    window.addEventListener('blur', stop)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', stop, { passive: true })
    document.addEventListener('visibilitychange', stop)
    document.addEventListener('keydown', stop)
    media.addEventListener('change', resize)
    return () => {
      stop()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointerout', leave)
      window.removeEventListener('blur', stop)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', stop)
      document.removeEventListener('visibilitychange', stop)
      document.removeEventListener('keydown', stop)
      media.removeEventListener('change', resize)
    }
  }, [])

  return <><canvas ref={canvasRef} className="smooth-cursor" aria-hidden="true" /><span ref={iconRef} className="smooth-cursor-icon" aria-hidden="true"><img alt="" /></span></>
}
