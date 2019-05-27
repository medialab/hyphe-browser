import '../../app/components/Header/header.styl'
import '../../app/components/CorpusLoadIndicators/corpus-load-indicators.styl'
import '../../app/containers/BrowserStack/browser-stack.styl'
import 'react-select/dist/react-select.css'
import '../../app/containers/BrowserStack/browser-stack-wes-list.styl'

import '../../app/containers/Browser/browser.styl'
import '../../app/containers/BrowserTabs/browser-tabs.styl'
import '../../app/containers/BrowserTabs/browser-tab-content.styl'
import '../../app/containers/BrowserTabs/browser-tab-label.styl'
import '../../app/containers/SideBar/side-bar-tags.styl'
import '../../app/containers/BrowserTabs/browser-tab-webentity-name-field.styl'
import '../../app/containers/BrowserTabs/browser-tab-url-field.styl'



import React, { useState } from 'react'
import cx from 'classnames'
import Select from 'react-select'

const DryHeader = () => (
  <header className="hyphe-header">
    <span className="header-left" style={ { width: 'unset' } }>
      <span className="corpus-load-indicators">
        <span className="corpus-load-title">Hyphe Server</span>
        <span className="hint--bottom" aria-label={ 'corpus is active' }>
          <span className={ 'corpus-load corpus-load-status-READY' } />
        </span>
        <span className="hint--bottom" aria-label={ 'pending' }>
          { 12 }
        </span>
        <span className="hint--bottom" aria-label={ 'running' }>
          { 13 }
        </span>
        <span className="hint--bottom" aria-label={ 'ok' }>
          <span className={ 'corpus-load corpus-load-health-OK' } />
        </span>
      </span>
    </span>
    <span className="header-center">{ 'Corpus name' }</span>
    <span className="header-right">
      <a className="disconnection hint--bottom-left" aria-label={ 'close corpus' }>
        <span className="ti-close" />
      </a>
    </span>
  </header>
)

const DryStackFillers = () => {
  const usefulStacks = ['IN', 'IN TO TAG', 'UNDECIDED',  'OUT']
    .map(name => ({ name }))// stacks.filter(s => s.name !== 'IN_UNCRAWLED' || counters[s.name])
    
  return (
    <span className="fillers">
      { usefulStacks.map((stack) => { 
        const disabled = false // !counters[stack.name] || loadingWebentityStack || loading
  
        return (
          <button
            key={ stack.name }
            className={ cx('filler', `filler-${stack.name.replace(/\s/g, '_')}`,
              { 'selected': false }) }
            disabled={ disabled }
          >
            <div className="filler-name hint--bottom" aria-label={ 'fill' }>
              { stack.name }
            </div>
            <div className="filler-counter">
              { 12 }
            </div>
          </button>
        )}
      ) }
    </span>
  )
}

const DryWebEntitiesList = function () {
  const options = [
    {
      value: 'test',
      label: 'test',
      name: 'test',
      indegree: 3,
      viwed: false
    }
  ]

  const renderOption = (option) => {
    const w = option
    const className = cx('browser-stack-wes-item', {
      focused: false,
      viewed: w.viewed,
      selected: false
    })
    
    return (
      <div className={ className } key={ option.value }>
        <span className="we-name" title={ w.name }>{ w.name }</span>
        <span className="we-indegree">{ w.indegree }</span>
      </div>
    )
  }
    
  const renderValue = (w) => {
    return (
      <div className="browser-stack-wes-value">
        <span className="we-name">{ w.name }</span>
        <span className="we-indegree">{ w.indegree }</span>
      </div>
    )
  }
  return (
    <Select
      className={ cx('browser-stack-wes-list', { loading: false }) }
      arrowRenderer={ () => <span className="ti-exchange-vertical" /> }
      clearable={ false }
      disabled={ false }
      labelKey={ 'name' }
      // keep in sync with .Select-menu-outer, .Select-menu max-height
      maxHeight={ 490 }
      onChange={ console.log }
      options={ options }
      optionRenderer={ renderOption }
      placeholder={ 'select stack' }
      searchable={ false }
      value={ options[0] }
      valueKey={ 'id' }
      valueRenderer={ renderValue }
    />
  )
}

const DryBrowserTabs = () => {
  return (
    <div className="browser-tabs" style={ { height: '100%' } }>
      <div className="browser-tab-labels">
          
        <div className="browser-tab-labels-main">
          <div className="browser-tab-label active" title="Tests, comparatifs et fiches techniques | 01net.com">
            <object data="https://static.bfmtv.com/ressources/favicon/site01net/favicon.ico" width="16" height="16" className="browser-tab-favicon" />
            <span className="browser-tab-title">01Net.com</span>
          </div>
          <div className="browser-tab-new" title="Open new tab" /></div>
      </div>
      {/* tabs */}
      <div tabIndex="1" className="browser-tab-content">
        <div className="browser-tab-toolbar">
          <div className="browser-tab-toolbar-webentity">
            <input className="browser-tab-webentity-name over-overlay" value="01Net.com" />
            <button className="btn btn-default btn-adjust hint--left" aria-label="Create a new webentity for this url">
              <span className="ti-plus" /></button></div><div className="browser-tab-toolbar-url">
                <form className="">
              <span className="btn browser-tab-url">
                    <em>https</em>://<em>www.01net</em><em>.com</em>/tests
                  </span>
            </form>
              </div>
          <div className="browser-tab-toolbar-navigation">
            <button className="btn btn-default  hint--left" aria-label="Refresh">
              <span className="ti-reload" />
            </button>
            <button className="btn btn-default  hint--left" aria-label="Previous page">
              <span className="ti-angle-left" />
            </button><button className="btn btn-default  hint--left" aria-label="Next page" disabled="">
              <span className="ti-angle-right" />
            </button>
          </div>
        </div>
        <div className="browser-tab-content-cols">
          <aside className="browser-side-bar">
            <div className="browser-side-bar-scroll">
              <div className="browser-side-bar-homepage">
                <button className="btn btn-default hint--bottom-right" aria-label="Set current page as Homepage">
                  <span className="ti-home" />
                </button>
                <button className="btn btn-default browser-side-bar-homepage-url hint--medium inactive">
                  <div disabled="">No Homepage defined yet</div>
                </button>
              </div>
              <div className="browser-side-bar-cols">
                <div className="browser-side-bar-info">
                  <h3>
                    <span><span>WebEntity</span></span>
                  </h3>
                  <div className="textinfo"><span>Crawled |</span> <strong><span>No</span></strong></div>
                  <div className="textinfo"><span>Linked by</span> 1 WE</div>
                </div><div className="browser-side-bar-status">
                  <h3><span><span>Status</span></span></h3>
                  <div><button className="btn btn-default hint--bottom status-in" aria-label="IN"><span>I</span></button>
                    <button className="btn btn-default hint--bottom status-undecided" aria-label="UNDECIDED"><span>?</span></button>
                    <button className="btn btn-default hint--bottom status-out" aria-label="OUT"><span>O</span></button>
                  </div></div></div><div className="browser-side-bar-sections">
                    <div className="browser-side-bar-tags">
                  <div>
                        <h3>
                      <span>Categories</span>
                      <span className="ti-angle-up" />
                    </h3>
                        <div><form className="browser-side-bar-tags-new-category">
                      <input placeholder="Add new category" disabled="" value="" />
                      <button className="btn btn-default  hint--left" aria-label="Add new category">
                            <span className="ti-plus" />
                          </button>
                    </form>
                    </div>
                      </div>
                </div>
                <h3>
                      <span>Context</span>
                      <span className="ti-angle-up" />
                    </h3>
                    <div className="browser-side-bar-contextual-lists">
                  <nav>
                        <button className="btn btn-default navigation selected">
                      <span>Linked pages</span>
                    </button>
                        <button className="btn btn-default navigation">
                      <span>Source entities</span>
                    </button>
                        <button className="btn btn-default navigation">
                      <span>Linked entities</span>
                    </button>
                        <div className="browser-side-bar-contextual-list">
                      <ul>
                            <li title="https://www.01net.com/tests/">
                          <div className="link-url inactive">https://www.01net.com/tests/</div>
                          <div className="link-linked">Linked <span>twice</span></div>
                        </li>
                          </ul>
                    </div>
                        <div className="download">
                      <button className="btn btn-default">
                            <strong><span>Download list as CSV</span><span>&nbsp;</span><span className="ti-download" /></strong>
                          </button>
                    </div>
                      </nav>
                </div>
                    <div className="browser-side-bar-tags">
                  <div className="browser-side-bar-tags-free-tags">
                        <h3><span>Research notes</span><span className="ti-angle-up" /></h3>
                        <div className="Select is-disabled is-searchable Select--multi">
                      <div className="Select-control">
                            <div className="Select-multi-value-wrapper" id="react-select-5--value">
                          <div className="Select-placeholder">Add a note</div>
                          <div
                                aria-expanded="false" aria-owns="" aria-activedescendant="react-select-5--value" aria-disabled="true"
                                className="Select-input" role="combobox" tabIndex="0" style={ { border: 0, width: 1, display: 'inline-block' } }
                              /></div><span className="Select-arrow-zone"><span className="Select-arrow" /></span></div></div></div></div></div></div></aside>
          <iframe style={{width: '100%', height: '100%', border: 'none'}}
            tabIndex="0" src="https://www.01net.com/tests/" preload="./utils/webview-preload-script.js" useragent="Mozilla/5.0 (X11; Linux ax86_64) AppleWebKit/537.36 (KHTML, like Gecko) hyphe-browser/1.0.0 Chrome/52.0.2743.82 Safari/537.36"
            autosize="on" guestinstance="5"
          /></div>
      </div>
    </div>
  )
}

const Layout = function (){
  return (
    <div style={ { height: '100vh' } } className="window browser-window">
      <DryHeader />

      <div className="browser-stack">
        <div className="browser-stack-wes">

          <button
            className="btn btn-default hint--bottom-right"
            aria-label={ 'previous' }
          >
            <span className="ti-angle-left" />
          </button>

          <div className="browser-stack-wes-selector">
            <DryWebEntitiesList />
          </div>

          <button
            className="btn btn-default hint--bottom-left"
            aria-label={ 'next' }
          >
            <span className="ti-angle-right" />
          </button>

        </div>
        <DryStackFillers />
      </div>

      <DryBrowserTabs />
    </div>
  )
}

export default Layout