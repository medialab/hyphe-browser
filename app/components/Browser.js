import React, { Component, PropTypes } from 'react';
import BrowserSidebar from './BrowserSidebar';
import ButtonGroup from './ButtonGroup';
import Button from './Button';
import BrowserUrl from './BrowserUrl';
import WebViewPane from './WebViewPane';
import styles from './Browser.module.css';

export default class Browser extends Component {
  static propTypes = {
    sidebarVisible: PropTypes.bool.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string,
      loading: PropTypes.bool,
      error: PropTypes.object,
    })).isRequired,
    activeTab: PropTypes.string,
    toggleSidebar: PropTypes.func.isRequired,
    openTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    setTabUrl: PropTypes.func.isRequired,
    setTabStatus: PropTypes.func.isRequired,
    setTabTitle: PropTypes.func.isRequired,
    setTabIcon: PropTypes.func.isRequired,
  }

  getActiveTab() {
    const { tabs, activeTab } = this.props;
    return tabs.find(({ id }) => id === activeTab);
  }

  updateTabStatus(id, event, info) {
    const { setTabStatus, setTabTitle, setTabIcon } = this.props;

    switch (event) {
    case 'start':
      setTabStatus({ loading: true }, id);
      break;
    case 'stop':
      setTabStatus({ loading: false, url: info }, id);
      break;
    case 'error':
      alert(info.errorDescription);
      setTabStatus({ loading: false, url: info.url, error: info }, id);
      break;
    case 'title':
      setTabTitle(info, id);
      break;
    case 'favicon':
      setTabIcon(info, id);
      break;
    default:
      break;
    }
  }

  renderWebViews() {
    const { tabs, activeTab } = this.props;

    const _onStatusUpdate = (id) => (event, info) => this.updateTabStatus(id, event, info);

    return tabs.map(({ id, url }) => (
      <WebViewPane key={ id } visible={ activeTab === id } url={ url } onStatusUpdate={ _onStatusUpdate(id) } />
    ));
  }

  renderTabs() {
    const { tabs, activeTab, closeTab, selectTab } = this.props;

    const _closeTab = (id) => (e) => {
      e.stopPropagation();
      closeTab(id);
    };

    return tabs.map(({ title, icon, id }) => (
      <div key={ id } className={ 'tab-item ' + ((activeTab === id) ? ' active' : '') } onClick={ () => selectTab(id) }>
        <span className="icon icon-cancel icon-close-tab" onClick={ _closeTab(id) }></span>
        { icon ? <img src={ icon } width="16" height="16" className={ styles.tabFavicon } /> : null }
        { title }
      </div>
    ));
  }

  renderSidebar() {
    const { sidebarVisible, openTab } = this.props;

    if (!sidebarVisible) {
      return null;
    }

    const showJSON = (o) => {
      const json = JSON.stringify(o);
      openTab('data:application/json,' + escape(json));
    };

    return <BrowserSidebar onClick={ openTab } onAjaxResult={ showJSON } />;
  }

  render() {
    const { sidebarVisible, toggleSidebar, openTab, setTabUrl } = this.props;
    const tab = this.getActiveTab();

    return (
      <div className="window">
        <header className="toolbar toolbar-header">
          <h1 className="title">Photon</h1>
          <div className={ 'toolbar-actions ' + styles.urlInputContainer }>
            <ButtonGroup>
              <Button size="large" icon="menu" onClick={ () => toggleSidebar() } dropdown={ !sidebarVisible } />
            </ButtonGroup>
            <BrowserUrl url={ tab ? tab.url : '' } disabled={ !tab } onSubmit={ (url) => setTabUrl(url) } />
            <ButtonGroup pullRight>
              <Button size="large" icon="left-open" onClick={ () => {} } disabled />
              <Button size="large" icon="right-open" onClick={ () => {} } disabled />
              <Button size="large" icon="ccw" onClick={ () => {} } disabled />
            </ButtonGroup>
          </div>
        </header>
        <div className="window-content">
          <div className="pane-group">
            { this.renderSidebar() }
            <div className="pane">
              <div className="tab-group">
                { this.renderTabs() }
                <div className="tab-item tab-item-fixed" onClick={ () => openTab() }>
                  <span className="icon icon-plus"></span>
                </div>
              </div>
              { this.renderWebViews() }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
