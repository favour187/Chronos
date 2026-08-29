import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { failed: boolean }












export class Safe3D extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(err: unknown) {

    console.warn('[CHRONOS] 3D layer disabled (WebGL unavailable):', err)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
