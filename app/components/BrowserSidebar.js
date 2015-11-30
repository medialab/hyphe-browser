import React, { Component } from 'react';
import $ from 'jquery';

export default class BrowserSidebar extends Component {
  static propTypes = {
    onClick: React.PropTypes.func.isRequired,
    onAjaxResult: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {loading: false};
  }

  ajaxRequest() {
    const { onAjaxResult } = this.props;

    this.setState({loading: true});
    $.post('http://hyphe.medialab.sciences-po.fr/dev-mathieu-api/', '{"method":"list_corpus","params":[]}')
      .then((result) => {
        onAjaxResult(result);
        this.setState({ loading: false });
      });
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

  renderLoading() {
    if (!this.state.loading) {
      return null;
    }

    return (
      <span className="nav-group-item">
        <span className="icon icon-ccw"></span>
        Loading…
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
          <h5 className="nav-group-title">Test Ajax</h5>
          <span onClick={ () => this.ajaxRequest() } className="nav-group-item">
            <span className="icon icon-home"></span>
            POST to Medialab
          </span>
          { this.renderLoading() }
        </nav>
      </div>
    );
  }
}
