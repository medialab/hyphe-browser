import React, { Component, PropTypes } from 'react';
import styles from './Browser.module.css';

export default class BrowserUrl extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  }

  constructor (props) {
    super({
      disabled: false,
      ...props
    });
  }

  render() {
    const { url, disabled } = this.props;

    return <input className={ styles.urlInput } type="url" placeholder="http://…" value={ url } disabled={ disabled } />;
  }
}
