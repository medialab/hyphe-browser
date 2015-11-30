import React, { Component } from 'react';

export default class BrowserSidebar extends Component {
  static propTypes = {
    onClick: React.PropTypes.func.isRequired,
  }

  renderLink(key, url) {
    const { onClick } = this.props;

    return (
      <span key={ key } onClick={ () => onClick(url) } className="nav-group-item">
        <span className="icon icon-home"></span>
        { key }
      </span>
    );
  }

  renderLinks() {
    const links = {
      Twitter: 'https://twitter.com/medialab_ScPo/status/591539149779431424',
      Youtube: 'https://www.youtube.com/watch?v=rp838o6vnYE',
      Facebook: 'https://www.facebook.com/sciencespo/',
      Linkedin: 'https://www.linkedin.com/in/paul-girard-57822118',
      Lepoint: 'http://www.lepoint.fr/',
    };

    return Object.keys(links).map((key) => this.renderLink(key, links[key]));
  }

  render() {
    return (
      <div className="pane pane-sm sidebar">
        <nav className="nav-group">
          <h5 className="nav-group-title">Crash test</h5>
          { this.renderLinks() }
        </nav>
      </div>
    );
  }
}
