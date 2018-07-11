class AmbientBase {
  initDOM() {
    const canvas = document.createElement('canvas')
    const devicePixelRatio = this.devicePixelRatio
    canvas.style.position = 'fixed'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.width = `${this.width / devicePixelRatio}px`
    canvas.style.height = `${this.height / devicePixelRatio}px`
    canvas.style.zIndex = -1
    canvas.style.pointerEvents = 'none'
    canvas.className = this.className
    canvas.width = this.width
    canvas.height = this.height
    this.parent.appendChild(canvas)
    this.canvas = canvas
  }

  initFPS() {
    this.INTERVAL = 1000 / this.FPS
    this.nextTime = Date.now()
    this.startTime = this.nextTime
  }

  play() {
    this.isPaused = false
    cancelAnimationFrame(this.rafId)
    this.loop()
  }

  pause() {
    this.isPaused = true
  }

  stop() {
    cancelAnimationFrame(this.rafId)
    this.pause()
  }

  toggle() {
    this.isPaused
      ? this.play()
      : this.pause()
  }

  destory() {
    this.stop()
    this.unbindEvents()
    this.parent.removeChild(this.canvas)
  }
}

export default AmbientBase