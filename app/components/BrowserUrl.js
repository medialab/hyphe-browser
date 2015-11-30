import React, { Component, PropTypes } from 'react';
import styles from './Browser.module.css';

export default class BrowserUrl extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onSubmit: PropTypes.func,
  }

  constructor (props) {
    super({
      disabled: false,
      ...props
    });
    this.state = { value: props.url };
  }

  componentWillReceiveProps(props) {
    this.setState({ value: props.url });
  }

  render() {
    const { disabled, onSubmit } = this.props;
    const { value } = this.state;

    const _onSubmit = (e) => {
      e.preventDefault();
      if (!value.match(/:\/\//)) {
        onSubmit('http://' + value);
      } else {
        onSubmit(value);
      }
    };

    const onChange = (e) => this.setState({ value: e.target.value });

    const inputProps = {
      disabled,
      value,
      onChange
    };

    return (
      <form onSubmit={ _onSubmit } className={ styles.urlForm }>
        <input type="text" placeholder="http://…" className={ styles.urlInput } { ...inputProps } />
      </form>
    );
  }
}
