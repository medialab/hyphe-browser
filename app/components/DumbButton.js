import React from 'react'

export default class DumbButton extends React.Component {

  constructor (props) {
    super(props)

    this.state = { clicked: false }
  }

  toggle () {
    this.setState({ clicked: !this.state.clicked })
  }

  render () {
    const label = this.state.clicked
      ? 'Clicked'
      : 'Click me!'

    return <button onClick={ () => this.toggle() }>{ label }</button>
  }

}
