import React, { Component, PropTypes } from 'react';

export default class Button extends Component {
  static propTypes = {
    size: PropTypes.oneOf(['mini', 'large']),
    icon: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    dropdown: PropTypes.bool,
  }

  constructor (props) {
    super({
      disabled: false,
      dropdown: false,
      size: null,
      ...props
    });
  }

  render() {
    const { size, icon, onClick, disabled, dropdown } = this.props;

    const clsSuffix = (size ? (' btn-' + size) : '') + (dropdown ? ' btn-dropdown' : '');

    return (
      <button className={ 'btn btn-default' + clsSuffix } disabled={ disabled } onClick={ onClick }>
        <span className={ 'icon icon-' + icon }></span>
      </button>
    )
  }
}
