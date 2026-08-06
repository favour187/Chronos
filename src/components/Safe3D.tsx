import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { failed: boolean }

/**
 * Error boundary for the WebGL 3D layer.
 *
 * If Three.js cannot create a WebGL context (old/blocked GPU, hardware
 * acceleration off, enterprise policy, some in-app webviews), renderer
 * construction throws during render. Without a boundary that error unmounts
 * the ENTIRE React tree — a black screen with no imagery at all.
 *
 * With this boundary, the 3D layer simply stays off and the cinematic
 * experience (AI backdrops, HUD, navigation) keeps working everywhere.
 */
export class Safe3D extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(err: unknown) {
    // One quiet log for debugging; the show goes on without WebGL.
    console.warn('[CHRONOS] 3D layer disabled (WebGL unavailable):', err)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
