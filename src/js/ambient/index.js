import debounce from 'lodash/debounce'
import {
  O2_AMBIENT_CLASSNAME,
  O2_AMBIENT_CONFIG
} from "../utils/const"
import AmbientBase from './ambient-base'
import { getDevicePixelRatio } from '../utils/util'

class Tunner extends AmbientBase {
  constructor() {
    super()
    this.devicePixelRatio = getDevicePixelRatio()
    this.className = O2_AMBIENT_CLASSNAME
    this.parent = document.querySelector('.o2team_ambient_main')
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.FPS = 30
    this.initFPS()
    this.bindEvents()
    this.reset()
    this.init()
  }

  init() {
    this.initDOM()
    this.initThree()
    this.play()
  }

  reset() {
    this.percentage = 0
    this.isPaused = false
  }

  initThree() {
    // S Three
    this.initRenderer()
    this.initScene()
    this.initCamera()
    this.initTunnel()
    // E Three
  }

  bindEvents() {
    this.windowResizeHandleSelf = debounce(this.windowResizeHandle.bind(this), 300)
    window.addEventListener('resize', this.windowResizeHandleSelf, false)
  }

  unbindEvents() {
    window.removeEventListener('resize', this.windowResizeHandleSelf, false)
  }

  windowResizeHandle(e) {
    const devicePixelRatio = this.devicePixelRatio

    this.width = window.innerWidth * devicePixelRatio
    this.height = window.innerHeight * devicePixelRatio
    // this.canvas.width = this.width
    // this.canvas.height = this.height
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
    this.canvas.style.width = `${this.width / devicePixelRatio}px`
    this.canvas.style.height = `${this.height / devicePixelRatio}px`
  }

  initRenderer() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    })
    renderer.setSize(this.width, this.height)
    this.renderer = renderer
  }

  initScene() {
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 30, 150)
    this.scene = scene
  }

  initCamera() {
    const camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 150)
    camera.position.y = 400
    camera.position.z = 400
    this.camera = camera
  }

  initTunnel() {
    // Array of points
    const points = [
      [68.5, 185.5],
      [1, 262.5],
      [270.9, 281.9],
      [345.5, 212.8],
      [178, 155.7],
      [240.3, 72.3],
      [153.4, 0.6],
      [52.6, 53.3],
      [68.5, 185.5]
    ]

    // Convert the array of points into vertices
    for (let i = 0; i < points.length; i++) {
      const x = points[i][0]
      const y = Math.random() * 100
      const z = points[i][1]
      points[i] = new THREE.Vector3(x, y, z)
    }
    // Create a path from the points
    const path = new THREE.CatmullRomCurve3(points)
    path.closed = true

    // Define the precision of the finale tube, the amount of divisions
    const tubeDetail = 1600
    // Define the precision of the circles
    const circlesDetail = 40

    // Define the radius of the finale tube
    const radius = 4
    // Get all the circles that will compose the tube
    const frames = path.computeFrenetFrames(tubeDetail, true)

    // Create an empty Geometry where we will put the particles
    const geometry = new THREE.Geometry()

    // Define a basic color
    // const color = new THREE.Color(0x000000)

    // First loop through all the circles
    for (let i = 0; i < tubeDetail; i++) {
      // Get the normal values for each circle
      const normal = frames.normals[i]
      // Get the binormal values
      const binormal = frames.binormals[i]

      // Calculate the index of the circle (from 0 to 1)
      const index = i / tubeDetail
      // Get the coordinates of the point in the center of the circle
      const p = path.getPointAt(index)

      // Loop for the amount of particles we want along each circle
      for (let j = 0; j < circlesDetail; j++) {
        // Clone the position of the point in the center
        const position = p.clone()

        // Calculate the angle for each particle along the circle (from 0 to Pi*2)
        const angle = ((j / circlesDetail) * (Math.PI * 2)) + (index * Math.PI * 5)
        // Calculate the sine of the angle
        const sin = Math.sin(angle)
        // Calculate the cosine from the angle
        const cos = -Math.cos(angle)

        // Calculate the normal of each point based on its angle
        const normalPoint = new THREE.Vector3(0, 0, 0)
        normalPoint.x = (cos * normal.x) + (sin * binormal.x)
        normalPoint.y = (cos * normal.y) + (sin * binormal.y)
        normalPoint.z = (cos * normal.z) + (sin * binormal.z)
        // Multiple the normal by the radius
        normalPoint.multiplyScalar(radius)

        // We add the normal values for each point
        position.add(normalPoint)
        const color = new THREE.Color(`hsl(${index * 360 * 4}, 100%, 50%)`)
        geometry.colors.push(color)
        geometry.vertices.push(position)
      }
    }

    // Material for the points
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: THREE.VertexColors
    })

    const tube = new THREE.Points(geometry, material)
    // Add tube into the scene
    this.scene.add(tube)
    this.tube = tube
    this.path = path
  }

  loop() {
    this.rafId = requestAnimationFrame(this.loop.bind(this))
    if (this.isPaused) return

    const now = Date.now()
    const elapsed = now - this.nextTime
    if (elapsed > this.INTERVAL) {
      this.nextTime = now - (elapsed % this.INTERVAL)
      const path = this.path
      const camera = this.camera

      this.percentage += 0.0005
      // console.log(path.getPointAt)
      const p1 = path.getPointAt(this.percentage % 1)
      const p2 = path.getPointAt((this.percentage + 0.01) % 1)
      camera.position.set(p1.x, p1.y, p1.z)
      camera.lookAt(p2)

      // Render the scene
      this.renderer.render(this.scene, camera)
    }
  }
}

export default Tunner
