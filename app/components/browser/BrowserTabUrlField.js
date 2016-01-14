import React, { PropTypes } from 'react'

class BrowserTabUrlField extends React.Component {

  constructor (props) {
    super(props)
    this.state = { url: props.initialUrl }
  }

  componentWillReceiveProps ({ initialUrl }) {
    if (initialUrl !== this.props.initialUrl && initialUrl !== this.state.url) {
      // Really a new URL (a priori incoming from Redux)
      this.setState({ url: initialUrl })
    }
  }

  shouldComponentUpdate ({ initialUrl }, { url }) {
    return this.state.url !== initialUrl || this.state.url !== url
  }

  onSubmit (e) {
    e.preventDefault()

    const url = ((u) => {
      if (!u.match(/:\/\//)) {
        this.setState({ url: 'http://' + u })
        return 'http://' + u
      } else {
        return u
      }
    })(this.state.url)

    this.props.onSubmit(url)
  }

  onChange (e) {
    e.stopPropagation()

    this.setState({ url: e.target.value })
  }

  render () {
    return (
      <form onSubmit={ (e) => this.onSubmit(e) }>
        <input className="btn btn-large" type="text" value={ this.state.url } onChange={ (e) => this.onChange(e) } />
      </form>
    )
  }
}

BrowserTabUrlField.propTypes = {
  initialUrl: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default BrowserTabUrlField
