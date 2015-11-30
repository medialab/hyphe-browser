import React, { Component, PropTypes } from 'react';

export default class ButtonGroup extends Component {
  static propTypes = {
    pullRight: PropTypes.bool,
  }

  constructor(props) {
    super({
      pullRight: false,
      ...props
    });
  }

  render() {
    const { children, pullRight } = this.props;

    return <div className={ 'btn-group' + (pullRight ? ' pull-right' : '') }>{ children }</div>;
  }
}
