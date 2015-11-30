import React, { Component, PropTypes } from 'react';
import BrowserSidebar from './BrowserSidebar';
import ButtonGroup from './ButtonGroup';
import Button from './Button';
import BrowserUrl from './BrowserUrl';
import styles from './Browser.module.css';

export default class Browser extends Component {
  static propTypes = {
    sidebarVisible: PropTypes.bool.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })).isRequired,
    activeTab: PropTypes.string.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
  }

  renderTabs () {
    const { tabs, activeTab, closeTab, selectTab } = this.props;

    return tabs.map(({ title, icon, id }) => (
      <div key={ id } className={ 'tab-item' + ((activeTab === id) ? ' active' : '') } onClick={ () => selectTab(id) }>
        <span className="icon icon-cancel icon-close-tab" onClick={ (e) => { e.stopPropagation(); closeTab(id); } }></span>
        { icon ? <img src={ icon } /> : null }
        { title }
      </div>
    ));
  }

  render() {
    const { sidebarVisible, toggleSidebar, openTab } = this.props;

    return (
      <div className="window">
        <header className="toolbar toolbar-header">
          <h1 className="title">Photon</h1>
          <div className={ 'toolbar-actions ' + styles.urlInputContainer }>
            <ButtonGroup>
              <Button size="large" icon="menu" onClick={ () => toggleSidebar() } dropdown={ !sidebarVisible } />
            </ButtonGroup>
            <BrowserUrl url={ '' } />
            <ButtonGroup pullRight>
              <Button size="large" icon="left-open" onClick={ () => {} } disabled />
              <Button size="large" icon="right-open" onClick={ () => {} } disabled />
              <Button size="large" icon="ccw" onClick={ () => {} } disabled />
            </ButtonGroup>
          </div>
        </header>
        <div className="window-content">
          <div className="pane-group">
            { sidebarVisible ? <BrowserSidebar /> : null }
            <div className="pane">
              <div className="tab-group">
                { this.renderTabs() }
                <div className="tab-item tab-item-fixed" onClick={ () => openTab() }>
                  <span className="icon icon-plus"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
