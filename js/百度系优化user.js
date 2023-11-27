// ==UserScript==
// @name         【移动端】-百度系优化
// @icon         https://www.baidu.com/favicon.ico
// @namespace    https://greasyfork.org/zh-CN/scripts/418349
// @supportURL   https://github.com/WhiteSevs/TamperMonkeyScript/issues
// @version      2023.11.27
// @author       WhiteSevs
// @run-at       document-start
// @description  用于【移动端】的百度系列产品优化，包括【百度搜索】、【百家号】、【百度贴吧】、【百度文库】、【百度经验】、【百度百科】、【百度知道】、【百度翻译】、【百度图片】、【百度地图】、【百度好看视频】、【百度爱企查】、【百度问题】、【百度识图】等
// @match        *://m.baidu.com/*
// @match        *://www.baidu.com/*
// @match        *://baijiahao.baidu.com/*
// @match        *://tieba.baidu.com/*
// @match        *://www.tieba.com/*
// @match        *://wk.baidu.com/*
// @match        *://tanbi.baidu.com/*
// @match        *://jingyan.baidu.com/*
// @match        *://baike.baidu.com/*
// @match        *://wapbaike.baidu.com/*
// @match        *://zhidao.baidu.com/*
// @match        *://fanyi.baidu.com/*
// @match        *://fanyi-app.baidu.com/*
// @match        *://image.baidu.com/*
// @match        *://map.baidu.com/*
// @match        *://xue.baidu.com/*
// @match        *://mbd.baidu.com/*
// @match        *://aiqicha.baidu.com/*
// @match        *://pos.baidu.com/*
// @match        *://haokan.baidu.com/*
// @match        *://graph.baidu.com/*
// @match        *://pan.baidu.com/*
// @match        *://yiyan.baidu.com/*
// @match        *://chat.baidu.com/*
// @match        *://easylearn.baidu.com/*
// @match        *://uf9kyh.smartapps.cn/*
// @connect      www.baidu.com
// @connect      m.baidu.com
// @connect      tieba.baidu.com
// @connect      www.tieba.com
// @connect      baike.baidu.com
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        unsafeWindow
// @require      https://update.greasyfork.org/scripts/449471/1249086/Viewer.js
// @require      https://update.greasyfork.org/scripts/455186/1285083/WhiteSevsUtils.js
// @require      https://update.greasyfork.org/scripts/465772/1274595/DOMUtils.js
// @downloadURL https://update.greasyfork.org/scripts/418349/%E3%80%90%E7%A7%BB%E5%8A%A8%E7%AB%AF%E3%80%91-%E7%99%BE%E5%BA%A6%E7%B3%BB%E4%BC%98%E5%8C%96.user.js
// @updateURL https://update.greasyfork.org/scripts/418349/%E3%80%90%E7%A7%BB%E5%8A%A8%E7%AB%AF%E3%80%91-%E7%99%BE%E5%BA%A6%E7%B3%BB%E4%BC%98%E5%8C%96.meta.js
// ==/UserScript==

(function () {
  /**
   * 是否为调试模式
   */
  const DEBUG = false;
  /**
   * @type {import("../库/Viewer")}
   */
  const Viewer = window.Viewer;
  /**
   * @type {import("../库/Utils")}
   */
  const utils = window.Utils.noConflict();
  /**
   * @type {import("../库/DOMUtils")}
   */
  const DOMUtils = window.DOMUtils.noConflict();
  const log = new utils.Log(GM_info);
  log.config({
    debug: DEBUG,
    logMaxCount: 20000,
    autoClearConsole: true,
    tag: true,
  });
  const httpx = new utils.Httpx(GM_xmlhttpRequest);
  httpx.config({
    logDetails: DEBUG,
    onabort: function () {
      log.error("请求取消");
    },
    ontimeout: function () {
      log.error("请求超时");
    },
    onerror: function (response) {
      log.error(["httpx-onerror 请求异常", response]);
    },
  });

  /**
   * 菜单对象
   */
  let GM_Menu = new utils.GM_Menu({
    GM_getValue,
    GM_setValue,
    GM_registerMenuCommand,
    GM_unregisterMenuCommand,
  });

  class LoadingView {
    /**
     *
     * @param {boolean} withIcon 是否添加icon
     * @param {boolean} isEnd icon是否添加在后面
     */
    constructor(withIcon, isEnd) {
      this.config = {
        className: "whitesev-load-view",
        textClassName: "whitesev-load-view-text",
        iconClassName: "whitesev-load-view-icon",
        outSideClassName: "whitesev-load-view-icon-outside",
        withInClassName: "whitesev-load-view-icon-within",
      };
      /**
       * @type {?HTMLElement}
       */
      this.loadingViewElement = null;
      this.loadingViewHTML = `
        <div class="${this.config.className}">
          <span class="${this.config.textClassName}">Loading...</span>
        </div>`.trim();
      this.loadingViewIconHTML = `
        <div class="${this.config.iconClassName}">
          <div class="${this.config.outSideClassName}"></div>
          <div class="${this.config.withInClassName}"></div>
        </div>`.trim();
      this.initCSS();
      this.initLoadingView(withIcon, isEnd);
    }
    /**
     * 加载需要的CSS
     */
    initCSS() {
      if (this.isExistsCSS()) {
        return;
      }
      let loadingViewCSSText = `
      .${this.config.className}{
        margin: 0.08rem;
        background: #fff;
        font-size: 15px;
        text-align: center;
        width: inherit;
        border-radius: 0.12rem;
      }
      .${this.config.iconClassName}{
        width: 45px;
      }
      .${this.config.className},
      .${this.config.iconClassName}{
        height: 45px;
        line-height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .${this.config.outSideClassName},
      .${this.config.withInClassName}{
        position: absolute;
        margin-left: 140px;
        border: 5px solid rgba(0, 183, 229, 0.9);
        opacity: .9;
        border-radius: 50px;
        width: 20px;
        height: 20px;
        margin: 0 auto;
      }
      .${this.config.outSideClassName}{
        background-color: rgba(0, 0, 0, 0);
        border-right: 5px solid rgba(0, 0, 0, 0);
        border-left: 5px solid rgba(0, 0, 0, 0);
        box-shadow: 0 0 35px #2187e7;
        -moz-animation: spinPulse 1s infinite ease-in-out;
        -webkit-animation: spinPulse 1s infinite ease-in-out;
        -o-animation: spinPulse 1s infinite ease-in-out;
        -ms-animation: spinPulse 1s infinite ease-in-out;
      }
      .${this.config.withInClassName}{
        background: rgba(0, 0, 0, 0) no-repeat center center;
        border-top: 5px solid rgba(0, 0, 0, 0);
        border-bottom: 5px solid rgba(0, 0, 0, 0);
        box-shadow: 0 0 15px #2187e7;
        -moz-animation: spinoffPulse 3s infinite linear;
        -webkit-animation: spinoffPulse 3s infinite linear;
        -o-animation: spinoffPulse 3s infinite linear;
        -ms-animation: spinoffPulse 3s infinite linear;
      }
      @-moz-keyframes spinPulse{0%{-moz-transform:rotate(160deg);opacity:0;box-shadow:0 0 1px #505050}
      50%{-moz-transform:rotate(145deg);opacity:1}
      100%{-moz-transform:rotate(-320deg);opacity:0}
      }
      @-moz-keyframes spinoffPulse{0%{-moz-transform:rotate(0)}
      100%{-moz-transform:rotate(360deg)}
      }
      @-webkit-keyframes spinPulse{0%{-webkit-transform:rotate(160deg);opacity:0;box-shadow:0 0 1px #505050}
      50%{-webkit-transform:rotate(145deg);opacity:1}
      100%{-webkit-transform:rotate(-320deg);opacity:0}
      }
      @-webkit-keyframes spinoffPulse{0%{-webkit-transform:rotate(0)}
      100%{-webkit-transform:rotate(360deg)}
      }
      @-o-keyframes spinPulse{0%{-o-transform:rotate(160deg);opacity:0;box-shadow:0 0 1px #505050}
      50%{-o-transform:rotate(145deg);opacity:1}
      100%{-o-transform:rotate(-320deg);opacity:0}
      }
      @-o-keyframes spinoffPulse{0%{-o-transform:rotate(0)}
      100%{-o-transform:rotate(360deg)}
      }
      @-ms-keyframes spinPulse{0%{-ms-transform:rotate(160deg);opacity:0;box-shadow:0 0 1px #505050}
      50%{-ms-transform:rotate(145deg);opacity:1}
      100%{-ms-transform:rotate(-320deg);opacity:0}
      }
      @-ms-keyframes spinoffPulse{0%{-ms-transform:rotate(0)}
      100%{-ms-transform:rotate(360deg)}
      }
      `;
      let loadingViewCSSElement = document.createElement("style");
      loadingViewCSSElement.setAttribute("type", "text/css");
      loadingViewCSSElement.setAttribute("data-from", "loadingView");
      loadingViewCSSElement.setAttribute("data-author", "whitesev");
      loadingViewCSSElement.innerHTML = loadingViewCSSText;
      if (document.documentElement.childNodes.length === 0) {
        /* 插入最底部 */
        document.documentElement.appendChild(loadingViewCSSElement);
      } else {
        /* 插入head内 */
        document.head.appendChild(loadingViewCSSElement);
      }
    }
    /**
     * 初始化loadingView元素
     * @param {boolean} withIcon 是否添加icon
     * @param {boolean} isEnd icon是否添加在后面
     * @returns {HTMLDivElement}
     */
    initLoadingView(withIcon = false, isEnd = true) {
      this.setLoadingViewElement(null);
      let divElement = document.createElement("div");
      divElement.innerHTML = this.loadingViewHTML;
      let resultElement = divElement.firstChild;
      if (withIcon) {
        let iconElement = document.createElement("div");
        iconElement.innerHTML = this.loadingViewIconHTML;
        if (isEnd) {
          resultElement.appendChild(iconElement.firstChild);
        } else {
          resultElement.insertBefore(
            iconElement.firstChild,
            resultElement.firstChild
          );
        }
      }
      this.setLoadingViewElement(resultElement);
      return resultElement;
    }
    /**
     * 设置LoadingView
     * @param {HTMLDivElement} element
     */
    setLoadingViewElement(element) {
      this.loadingViewElement = element;
    }
    /**
     * 获取LoadingView
     * @returns {?HTMLDivElement}
     */
    getLoadingViewElement() {
      if (!this.loadingViewElement) {
        throw new Error("object loadingViewElement is null");
      }
      return this.loadingViewElement;
    }
    /**
     * 获取实例化的loadingView的icon
     * @returns {Element|undefined}
     */
    getIconElement() {
      return this.getLoadingViewElement().querySelector(
        "." + this.config.iconClassName
      );
    }
    /**
     * 显示LoadingView
     */
    show() {
      this.getLoadingViewElement().style.display = "";
    }
    /**
     * 隐藏LoadingView
     */
    hide() {
      this.getLoadingViewElement().style.display = "none";
    }
    /**
     * 显示icon
     */
    showIcon() {
      let iconElement = this.getIconElement();
      iconElement && (iconElement.style.display = "");
    }
    /**
     * 隐藏icon
     */
    hideIcon() {
      let iconElement = this.getIconElement();
      iconElement && (iconElement.style.display = "none");
    }
    /**
     * 设置文本
     * @param {string} text 文本
     * @param {boolean} withIcon 是否设置Icon图标
     * @param {boolean} isEnd icon是否添加在后面
     */
    setText(text, withIcon = false, isEnd = true) {
      this.getLoadingViewElement().innerHTML = `<span>${text}</span>`;
      if (withIcon) {
        let iconElement = this.getIconElement();
        if (!iconElement) {
          let divElement = document.createElement("div");
          divElement.innerHTML = this.loadingViewIconHTML;
          iconElement = divElement.firstChild;
          if (isEnd) {
            this.getLoadingViewElement().appendChild(iconElement);
          } else {
            this.getLoadingViewElement().insertBefore(
              iconElement,
              this.getLoadingViewElement().firstChild
            );
          }
        }
        iconElement.style.display = "";
      } else {
        this.getIconElement()?.remove();
      }
    }
    /**
     * 删除Loading元素
     */
    destory() {
      this.getLoadingViewElement()?.remove();
      this.setLoadingViewElement(null);
    }
    /**
     * 删除页面中所有的loadingView
     */
    removeAll() {
      document
        .querySelectorAll("." + this.config.className)
        .forEach((item) => item.remove());
    }
    /**
     * 判断Loading是否已加载到页面中
     * @returns {boolean}
     */
    isExists() {
      return Boolean(document.querySelector(`.${this.config.className}`));
    }
    /**
     * 判断Loading是否存在Loading图标
     * @returns {boolean}
     */
    isExistsIcon() {
      return Boolean(this.getIconElement());
    }
    /**
     * 判断Loading中的文本是否存在
     * @returns {boolean}
     */
    isExistsText() {
      return Boolean(
        this.getLoadingViewElement().querySelector(
          `.${this.config.textClassName}`
        )
      );
    }
    /**
     * 判断页面中是否存在CSS的style
     * @returns {boolean}
     */
    isExistsCSS() {
      return Boolean(
        document.querySelector(
          "style[data-from='loadingView'][type='text/css'][data-author='whitesev']"
        )
      );
    }
  }

  /**
   * 动态的搜索建议组件
   */
  class SearchSuggestion {
    constructor(paramConfig) {
      let that = this;
      this.config = {
        /**
         * 目标input元素
         * @type {Element}
         */
        targetElement: paramConfig.targetElement,
        /**
         * 搜索的数据
         * @type {array}
         */
        data: paramConfig.data || [],
        /**
         * 用于显示的数据
         * @type {array}
         */
        showData: paramConfig.showData || [],
        /**
         * 是否使用absoult显示建议框
         * @type {boolean}
         * + true 默认 position为absoulte
         * + false position为fixed
         */
        isAbsolute:
          typeof paramConfig.isAbsolute === "undefined"
            ? true
            : paramConfig.isAbsolute,
        /**
         * 显示删除按钮
         * @type {boolean}
         * + true 默认 显示
         * + false 不显示
         */
        showDeleteIcon:
          typeof paramConfig.showDeleteIcon === "undefined"
            ? true
            : paramConfig.showDeleteIcon,
        element: {
          /**
           * @type {string} div元素的className
           */
          searchSelectClassName:
            (paramConfig.element &&
              paramConfig.element.searchSelectClassName) ||
            "WhiteSevsSearchSelect",
          /**
           * @type {string} ul元素的className
           */
          searchSelectHintClassName:
            (paramConfig.element &&
              paramConfig.element.searchSelectHintClassName) ||
            "whiteSevSearchHint",
          /**
           * @type {string} div元素隐藏的className
           */
          searchSelectHideClassName:
            (paramConfig.element &&
              paramConfig.element.searchSelectHideClassName) ||
            "WhiteSevsSearchSelectHide",
        },
        css: {
          falInDuration:
            (paramConfig.css && paramConfig.css.falInDuration) || 0.5,
          falInTiming:
            (paramConfig.css && paramConfig.css.falInTiming) || "linear",
          falOutDuration:
            (paramConfig.css && paramConfig.css.falOutDuration) || 0.5,
          falOutTiming:
            (paramConfig.css && paramConfig.css.falOutTiming) || "linear",
          /**
           * @type {number} 选择框距离输入框距离
           */
          PaddingTop: (paramConfig.css && paramConfig.css.PaddingTop) || 8,
        },
        /**
         * 搜索没结果的html
         * @type {string}
         */
        noSearchDataHTML:
          paramConfig.noSearchDataHTML || '<li class="none">暂无其它数据</li>',
        /**
         * input元素内容改变时的回调，用于获取搜索建议列表
         */
        searchInputChangeCallBack:
          paramConfig.searchInputChangeCallBack ||
          function () {
            return [];
          },
        /**
         * 当前项点击的回调
         * @param {string} 当前项点击的值
         */
        clickItemCallBack:
          paramConfig.clickItemCallBack ||
          function (text) {
            that.setTargetInputValue(text);
            that.config.targetElement.dispatchEvent(new Event("blur"));
          },
        /**
         * 搜索项的删除回调
         * @param {number} itemElementIndex 当前删除的项的下标
         * @param {Element} itemElement 当前删除的项的元素
         */
        deleteItemCallBack:
          paramConfig.deleteItemCallBack ||
          function (itemElementIndex, itemElement) {
            that.config.data.splice(dataId, 1);
            that.config.showData.splice(dataId, 1);
            itemElement.remove();
            /* 把索引顺序重新排序一下 */
            that.getSearchSelectItemElementList().forEach((item2, index2) => {
              item2.setAttribute("data-id", index2);
            });
          },
        /**
         * 获取每一项的值，传入当前项，默认返回当前项
         * @param {any} value
         * @returns {any}
         */
        getItemValue:
          paramConfig.getItemValue ||
          function (value) {
            return value;
          },
        /**
         * 获取每一项的html，传入当前项，默认返回当前项
         * @param {any} value
         * @returns {any}
         */
        getItemHTML:
          paramConfig.getItemHTML ||
          function (value) {
            return value;
          },
      };
      /**
       * 该对象执行中的存储的一些用于判断的flag或存储的数据
       */
      this.details = {
        /**
         * 当前点击的是否是删除按钮
         * @type {boolean}
         */
        isDeleteClicked: false,
      };
      if (!this.getSearchSelectElement()) {
        this.setSearchSelectElement();
        this.setCSS();
      }
      this.setTargetInputEvent();
      this.setItemEvent();
      if (this.config.showData.length) {
        this.update(this.config.showData);
      }
    }
    /**
     * 获取显示出搜索建议框的html
     * @returns {string}
     */
    getSearchSelectHTML() {
      return `
      <div class="${this.config.element.searchSelectClassName}" style="display: none;">
        <ul class="${this.config.element.searchSelectHintClassName}">
            ${this.config.noSearchDataHTML}
        </ul>
      </div>`;
    }
    /**
     * 获取显示出搜索建议框的每一项的html
     * @param {any} item 当前项的值
     * @param {number} index 当前项的下标
     * @returns {string}
     */
    getSearchItemHTML(item, index) {
      return `
      <li 
          class="item"
          data-id="${index}"
          data-value="${this.config.getItemValue(item)}">
          ${this.config.getItemHTML(
            item
          )}${this.getSearchSelectDeleteIconHTML()}
      </li>`;
    }
    /**
     * 获取搜索建议框的元素
     * @param {Element|undefined} doc
     * @returns {Element|undefined}
     */
    getSearchSelectElement(doc) {
      return (doc || document).querySelector(
        "." + this.config.element.searchSelectClassName
      );
    }
    /**
     * 获取搜索建议框ul的元素
     * @param {Element|undefined} doc
     * @returns {Element|undefined}
     */
    getSearchSelectHintElement(doc) {
      return (doc || document).querySelector(
        "ul." + this.config.element.searchSelectHintClassName
      );
    }
    /**
     * 获取搜索建议框li的元素
     * @param {Element|undefined} doc
     * @returns {NodeList|undefined}
     */
    getSearchSelectItemElementList(doc) {
      return (doc || document).querySelectorAll(
        "ul." + this.config.element.searchSelectHintClassName + " li"
      );
    }
    /**
     * 获取删除按钮的html
     * @returns {string}
     */
    getDeleteIconHTML() {
      return `
      <svg t="1669172591973" data-delete-search viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2719" width="16" height="16" style="position: absolute;right: 8px;">
        <path data-delete-search d="M512 883.2A371.2 371.2 0 1 0 140.8 512 371.2 371.2 0 0 0 512 883.2z m0 64a435.2 435.2 0 1 1 435.2-435.2 435.2 435.2 0 0 1-435.2 435.2z" p-id="2720" fill="#e3dfdd"></path>
        <path data-delete-search d="M557.056 512l122.368 122.368a31.744 31.744 0 1 1-45.056 45.056L512 557.056l-122.368 122.368a31.744 31.744 0 1 1-45.056-45.056L466.944 512 344.576 389.632a31.744 31.744 0 1 1 45.056-45.056L512 466.944l122.368-122.368a31.744 31.744 0 1 1 45.056 45.056z" p-id="2721" fill="#e3dfdd"></path>
      </svg>
      `;
    }
    /**
     * 设置css
     */
    setCSS() {
      let css = `
      <style>
      div.${this.config.element.searchSelectClassName}{
          position: ${this.config.isAbsolute ? "absolute" : "fixed"};
          z-index: ${utils.getMaxZIndex()};
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0;
          margin-top: ${
            this.config.targetElement.getBoundingClientRect().bottom +
            this.config.css.PaddingTop
          }px;
      }
      div.${this.config.element.searchSelectHideClassName}{
          display: none;
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      }{
          width: ${this.config.targetElement.getBoundingClientRect().width}px;
          left: ${this.config.targetElement.getBoundingClientRect().left}px;
          max-height: 300px;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 5px 0;
          background-color: #fff;
          box-sizing: border-box;
          border-radius: 4px;
          box-shadow: 0 1px 6px rgb(0 0 0 / 20%);
          position: absolute;
          z-index: inherit;
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      } li{
          margin: 0;
          line-height: normal;
          padding: 7px 16px;
          clear: both;
          color: #515a6e;
          font-size: 14px!important;
          list-style: none;
          cursor: pointer;
          transition: background .2s ease-in-out;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-right: 32px;
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      } li:hover{
          background-color: rgba(0, 0, 0, .1);
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      } .none{
          padding: 0 16px;
          text-align: center;
          color: #ccc;
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      } .active{
          color: #57a3f3;
      }
      /*定义滚动条高宽及背景
      高宽分别对应横竖滚动条的尺寸*/
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      }::-webkit-scrollbar {
          width: 5px;
          height: 5px;
          background-color: #fff;
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      }::-moz-scrollbar {
          width: 5px;
          height: 5px;
          background-color: #fff;
      }
      /*定义滚动条轨道
      内阴影+圆角*/
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      }::-webkit-scrollbar-track {
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          border-radius: 2px;
          background-color: #fff;
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      }::-moz-scrollbar-track {
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          border-radius: 2px;
          background-color: #fff;
      }
      /*定义滑块
      内阴影+圆角*/
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      }::-webkit-scrollbar-thumb {
          border-radius: 2px;
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          background-color: #ccc;
      }
      div.${this.config.element.searchSelectClassName} ul.${
        this.config.element.searchSelectHintClassName
      }::-moz-scrollbar-thumb {
          border-radius: 2px;
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
          background-color: #ccc;
      }
      @keyframes searchSelectFalIn {
          from {
              opacity: 0;
              display:none;
          }
          to {
              display:block;
              opacity: 1;
          }
      }
      @keyframes searchSelectFalOut {
          from {
              display:block;
              opacity: 1;
          }
          to {
              opacity: 0;
              display:none;
          }
      }
  </style>`;
      document.body.appendChild(this.parseTextToElement(css));
    }
    /**
     * 把搜索元素添加到页面中
     */
    setSearchSelectElement() {
      document.body.appendChild(
        this.parseTextToElement(this.getSearchSelectHTML())
      );
    }
    /**
     * 字符串转元素
     * @param {string} text
     * @returns {Element}
     */
    parseTextToElement(text) {
      text = text
        .replace(/^[\n|\s]*/g, "")
        .replace(/[\n|\s]*$/g, ""); /* 去除前后的换行和空格 */
      let objE = document.createElement("div");
      objE.innerHTML = text;
      let result = objE.children.length == 1 ? objE.children[0] : objE.children;
      return result;
    }
    /**
     * 添加正在搜索中
     */
    addSearching() {
      this.getSearchSelectHintElement().appendChild(
        this.parseTextToElement(`<li class="searching">正在搜索中...</li>`)
      );
    }
    /**
     * 删除正在搜索中的提示
     */
    removeSearching() {
      this.getSearchSelectHintElement().querySelector("li.searching")?.remove();
    }
    /**
     * 删除已有的搜索结果
     */
    removeAllSearch() {
      this.getSearchSelectItemElementList().forEach((item) => item.remove());
    }
    /**
     * 动态设置搜索建议框的宽度，因为目标输入框元素可能是动态隐藏的
     */
    changeSelectCSS() {
      this.getSearchSelectHintElement().style.width =
        this.config.targetElement.getBoundingClientRect().width + "px";
      this.getSearchSelectHintElement().style.left =
        this.config.targetElement.getBoundingClientRect().left + "px";
    }
    /**
     * 获取后面的删除按钮html
     * @returns {string}
     */
    getSearchSelectDeleteIconHTML() {
      if (this.config.showDeleteIcon) {
        return `
        <svg data-delete-search t="1669172591973" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2719" width="16" height="16" style="position: absolute;right: 8px;">
          <path data-delete-search d="M512 883.2A371.2 371.2 0 1 0 140.8 512 371.2 371.2 0 0 0 512 883.2z m0 64a435.2 435.2 0 1 1 435.2-435.2 435.2 435.2 0 0 1-435.2 435.2z" p-id="2720" fill="#e3dfdd"></path>
          <path data-delete-search d="M557.056 512l122.368 122.368a31.744 31.744 0 1 1-45.056 45.056L512 557.056l-122.368 122.368a31.744 31.744 0 1 1-45.056-45.056L466.944 512 344.576 389.632a31.744 31.744 0 1 1 45.056-45.056L512 466.944l122.368-122.368a31.744 31.744 0 1 1 45.056 45.056z" p-id="2721" fill="#e3dfdd"></path>
        </svg>`;
      } else {
        return "";
      }
    }
    /**
     * 更新页面显示的搜索结果
     * @param {array} data
     */
    update(data) {
      if (!Array.isArray(data)) {
        throw new Error("传入的数据不是数组");
      }
      let that = this;
      this.config.showData = this.arrayDistinct(data);
      this.removeAllSearch();
      let parentUlDOM = this.getSearchSelectHintElement();
      if (!this.config.showData.length) {
        this.clear();
        if (this.config.targetElement.value === "") {
          this.config.data.forEach((item, index) => {
            parentUlDOM.appendChild(
              that.parseTextToElement(that.getSearchItemHTML(item, index))
            );
          });
          this.setItemEvent();
        } else {
          this.config.targetElement.dispatchEvent(new Event("focus"));
        }
      } else {
        this.config.showData.forEach((item, index) => {
          parentUlDOM.appendChild(
            that.parseTextToElement(that.getSearchItemHTML(item, index))
          );
        });
        this.setItemEvent();
      }
    }
    /**
     * 数组去重
     * @param {array} data
     * @returns {array}
     */
    arrayDistinct(data = []) {
      let result = [];
      data = new Set(data);
      for (let item of data.values()) {
        result = [item, ...result];
      }
      return result;
    }
    /**
     * 清空当前的建议
     */
    clear() {
      this.config.showData = [];
      this.removeAllSearch();
      this.getSearchSelectHintElement().appendChild(
        this.parseTextToElement(this.config.noSearchDataHTML)
      );
    }
    /**
     * 隐藏建议框
     */
    hide() {
      this.getSearchSelectElement().setAttribute("style", "display: none;");
    }
    /**
     * 显示建议框
     */
    show() {
      this.getSearchSelectElement().removeAttribute("style");
    }
    /**
     * 设置目标输入框的值
     * @param {string} value
     */
    setTargetInputValue(value) {
      this.config.targetElement.value = value;
    }
    /**
     * 设置目标输入框的各种事件
     */
    setTargetInputEvent() {
      let that = this;
      function _focus_event_(event) {
        that.getSearchSelectElement().setAttribute(
          "style",
          `
                    -moz-animation: searchSelectFalIn ${
                      that.config.css.falInDuration
                    }s 1 ${that.config.css.falInTiming};
                    -webkit-animation: searchSelectFalIn ${
                      that.config.css.falInDuration
                    }s 1 ${that.config.css.falInTiming};
                    -o-animation: searchSelectFalIn ${
                      that.config.css.falInDuration
                    }s 1 ${that.config.css.falInTiming};
                    -ms-animation: searchSelectFalIn ${
                      that.config.css.falInDuration
                    }s 1 ${that.config.css.falInTiming};
                    margin-top: ${
                      that.config.targetElement.getBoundingClientRect().bottom +
                      that.config.css.PaddingTop
                    }px;
                    `
        );

        that.changeSelectCSS();
      }
      function _blur_event_(event) {
        setTimeout(() => {
          if (that.details.isDeleteClicked) {
            return;
          }
          if (
            getComputedStyle(that.getSearchSelectElement()).display === "none"
          ) {
            return;
          }
          that.getSearchSelectElement().setAttribute(
            "style",
            `
              -moz-animation: searchSelectFalOut ${that.falOutDuration}s 1 ${
              that.falOutTiming
            };
              -webkit-animation: searchSelectFalOut ${that.falOutDuration}s 1 ${
              that.falOutTiming
            };
              -o-animation: searchSelectFalOut ${that.falOutDuration}s 1 ${
              that.falOutTiming
            };
              -ms-animation: searchSelectFalOut ${that.falOutDuration}s 1 ${
              that.falOutTiming
            };
              margin-top: ${
                that.config.targetElement.getBoundingClientRect().bottom +
                that.config.css.PaddingTop
              }px;
                        `
          );
          setTimeout(() => {
            that
              .getSearchSelectElement()
              .setAttribute("style", "display:none;");
          }, that.falOutDuration * 1000);
        }, 100);
      }
      function _click_event(event) {
        event.target.dispatchEvent(new Event("focus"));
      }
      async function _propertychange_event_(event) {
        that.config.targetElement.dispatchEvent(new Event("focus"));
        let getListResult = await that.getList(event.target.value);
        that.update(getListResult);
      }
      /* 禁用输入框自动提示 */
      this.config.targetElement.setAttribute("autocomplete", "off");
      /* 输入框获取焦点事件 */
      this.config.targetElement.addEventListener("focus", _focus_event_, true);
      /* 输入框点击事件 */
      this.config.targetElement.addEventListener("click", _click_event, true);
      /* 输入框失去焦点事件 */
      this.config.targetElement.addEventListener("blur", _blur_event_, false);
      /* 输入框内容改变事件 */
      this.config.targetElement.addEventListener(
        "input",
        _propertychange_event_,
        true
      );
      const userDocumentClickEvent = function () {
        let checkDOM = that.getSearchSelectHintElement();
        let mouseClickPosX = Number(
          window.event.clientX
        ); /* 鼠标相对屏幕横坐标 */
        let mouseClickPosY = Number(
          window.event.clientY
        ); /* 鼠标相对屏幕纵坐标 */
        let elementPosXLeft = Number(
          checkDOM.getBoundingClientRect().left
        ); /* 要检测的元素的相对屏幕的横坐标最左边 */
        let elementPosXRight = Number(
          checkDOM.getBoundingClientRect().right
        ); /* 要检测的元素的相对屏幕的横坐标最右边 */
        let elementPosYTop = Number(
          checkDOM.getBoundingClientRect().top
        ); /* 要检测的元素的相对屏幕的纵坐标最上边 */
        let elementPosYBottom = Number(
          checkDOM.getBoundingClientRect().bottom
        ); /* 要检测的元素的相对屏幕的纵坐标最下边 */
        if (
          !(
            mouseClickPosX >= elementPosXLeft &&
            mouseClickPosX <= elementPosXRight &&
            mouseClickPosY >= elementPosYTop &&
            mouseClickPosY <= elementPosYBottom
          ) &&
          !(
            checkDOM.innerHTML.includes(window.event.target.innerHTML) ||
            that.config.targetElement.innerHTML.includes(
              window.event.target.innerHTML
            )
          )
        ) {
          /* 不在点击范围内或元素上，隐藏 */
          that.details.isDeleteClicked = false;
          that.config.targetElement.dispatchEvent(new Event("blur"));
        }
      };
      document.addEventListener("touchstart", userDocumentClickEvent);
      document.addEventListener("click", userDocumentClickEvent);

      this.removeTargetInputEvent = function () {
        this.config.targetElement.removeAttribute("autocomplete");
        this.config.targetElement.removeEventListener(
          "focus",
          _focus_event_,
          true
        );
        this.config.targetElement.removeEventListener(
          "click",
          _click_event,
          true
        );
        this.config.targetElement.removeEventListener(
          "blur",
          _blur_event_,
          false
        );
        this.config.targetElement.removeEventListener(
          "input",
          _propertychange_event_,
          true
        );
        document.removeEventListener("touchstart", userDocumentClickEvent);
        document.removeEventListener("click", userDocumentClickEvent);
      };
    }
    /**
     * 移除目标输入框的各种事件
     */
    removeTargetInputEvent() {}
    /**
     * 设置搜索建议各个项的事件
     */
    setItemEvent() {
      let that = this;
      this.getSearchSelectItemElementList().forEach((item, index) => {
        ((item2) => {
          item2.addEventListener(
            "click",
            function (event) {
              utils.preventEvent(event);
              that.details.isDeleteClicked = false;
              that.config.targetElement.dispatchEvent(new Event("focus"));
              let clickElement = event.target;
              if (
                clickElement.hasAttribute("data-delete-search") &&
                (clickElement.localName === "svg" ||
                  clickElement.localName === "path")
              ) {
                /* 是删除按钮 */
                that.details.isDeleteClicked = true;
                let dataId = parseInt(item2.getAttribute("data-id"));
                that.config.deleteItemCallBack(dataId, item2);
                if (that.config.data.length === 0) {
                  that.clear();
                }
              } else {
                that.config.clickItemCallBack(this.getAttribute("data-value"));
              }
            },
            true
          );
        })(item, index);
      });
    }
    /**
     * 获取数组数据
     * @param {string} text
     * @returns
     */
    getList(text) {
      let event = {};
      let that = this;
      event.text = text;
      event.targetElement = this.targetElement;
      event.data = this.config.data;
      event.showData = this.config.showData;
      this.removeSearching();
      this.addSearching();
      return new Promise(async (resolve) => {
        let result = await that.config.searchInputChangeCallBack(event);
        if (this.config.targetElement.value !== "" && result.length == 0) {
          this.config.targetElement.dispatchEvent(new Event("focus"));
        }
        that.removeSearching();
        resolve(result);
      });
    }
  }

  const baidu = {
    /**
     * 当前url
     * window.location.href
     */
    url: window.location.href,
    init() {
      this.search();
      this.searchHome();
      this.baijiahao();
      this.tieba();
      this.wenku();
      this.jingyan();
      this.baike();
      this.baiketashuo();
      this.zhidao();
      this.fanyi();
      this.fanyiApp();
      this.image();
      this.map();
      this.mbd();
      this.xue();
      this.aiqicha();
      this.pos();
      this.haokan();
      this.graph();
      this.pan();
      this.yiyan();
      this.chat();
      this.mini_jiaoyu();
      this.easyLearn();
    },
    css: {
      search: `
			.c-container.na-ec-item,
			.c-container.ec-container,
			div[data-type="ad"],
			.c-result.sfc-log[data-tpl="adv_wenku_fc"],
			.c-recomm-wrap.new-ux-recom-wrapper.animation,
			#results-pre,
			.video-recommend,
			.c-result.sfc-log[data-tpl="search_recomm"],
			.sfc-image-content-waterfall-item[wat-item-data-id="no-img"],
			.se-results-pre,
			.ec_wise_ad,
			div#copyright + div,
			div#pop-up,
			div[class*='ad-wrapper__'],
			div[class*='rec-wrapper__'],
      .brand-entry,
      .barea-ad,
      .swan-ad-fc-rcmd.swan-ad-fc-base-wrap[data-platform],
      div#page-bd div.recommend,
      div.short-mini div[data-module="rec:undefined-undefined"],
      /* 相关软件 */
      div[srcid="sigma_celebrity_rela"],
      /* 搜一些隐私的内容时弹出的来的，开启无痕模式----保护隐私，安全浏览 */
      div:has(p.ivk-private-p){
				display:none !important;
			}
			.searchboxtop.newsearch-white-style .se-form {
				border-color: #4e6ef2 !important;
			}
			.searchboxtop.newsearch-white-style .se-bn {
				color: #fff !important;
				background: #4e6ef2 !important;
			}
			.se-head-logo .se-logo img {
				display: inherit !important;
			}
			.se-head-tablink {
				border-bottom: 1px solid #e6e6e6 !important;
				//background-color: #fff !important;
				background-color: transparent !important;
			}

			a.se-tabitem span{
				color: #000 !important;
			}
			// div.c-peak-layer{
			//   display:none !important;
			// } 百度关键字背景
			.se-tablink-scroll-wrapper .se-tab-cur:after{
				border-bottom: 2px solid #38f !important;
			}
			.c-tags-scroll.c-padding-x{
				display: none !important;
			}
			.white-bdsearch-isredirecrt{  
				display: inline-flex;
				background: #43ba76;
				color: #fff;
				width: 28px;
				font-size: 16px;
				line-height: 25px;
				justify-content: center;
				align-items: center;
				border-radius: 5px;
				margin: 0 auto;
				margin-right: 6px;
			}
			/* 修复图片显示问题 */
			.image-strong-card div[class*="image-content__"] > div{
				display: inline-block;
				overflow: hidden;
				vertical-align: top;
			}
			.c-result-content div[class*="tieba-newxml-forum-img-class__"]{
				display: -webkit-box;
				display: -webkit-flex;
				display: flex;
				-webkit-box-align: center;
        -moz-box-align: center;
				-webkit-align-items: center;
				align-items: center;
			}
			
			.c-result-content div[class*="tieba-newxml-forum-img__"]{
				width: .553rem;
				height: .553rem;
			}
			
			.c-result-content div[class*="tieba-newxml-forum-img__"] img{
				width: 100%;
				height: 100%;
				border-radius: .09rem;
			}
			.c-result-content div[class*="tieba-newxml-forum-class__"]{
				display: -webkit-flex;
				display: flex;
				-webkit-box-orient: vertical;
        -moz-box-orient: vertical;
				-webkit-box-direction: normal;
        -moz-box-direction: normal;
				-webkit-flex-direction: column;
        -moz-flex-direction: column;
				flex-direction: column;
				-webkit-box-pack: center;
				-moz-box-pack: center;
				-webkit-justify-content: center;
				-moz-justify-content: center;
				justify-content: center;
				max-width: 2.2rem;
			}
			.c-result-content div[class*="c-img-content-btn__"]{
				position: absolute;
				right: 0;
				width: .55rem;
				text-align: center;
				line-height: .28rem;
				border: 1px solid rgba(31,31,31,.5);
				border-radius: .15rem;
				font-family: PingFangSC-Medium;
				font-size: .13rem;
				color: #1f1f1f;
			}
			.c-result-content div[class*="tieba-newxml-thread-comment-user__"]{
				display: -webkit-flex;
				display: flex;
				-webkit-box-align: center;
				-moz-box-align: center;
				-webkit-align-items: center;
				-moz-align-items: center;
				align-items: center;
				margin-top: .03rem;
			}
			.c-result-content div[class*="tieba-newxml-thread-comment-user__"] img{
				width: .16rem;
				height: .16rem;
				border-radius: 50%;
			}
			.c-result-content div[class*="tieba-newxml-thread-comment-user__"] span{
				margin-right: .08rem;
			}
			.whitesev-gm-refactor-everyone-searching{
        width: 100%;
        box-sizing: border-box;
        height: 2.857em;
        line-height: 2.857;
        background-color: #f5f6f9;
        border-color: #f5f6f9;
        padding: 0 .08rem;
        vertical-align: middle;
        outline: 0;
        font-size: 14px;
        overflow: hidden;
        border-radius: 9px;
        text-align: center;
        text-decoration: none;
        -webkit-tap-highlight-color: transparent;
        -moz-tap-highlight-color: transparent;
        text-overflow: ellipsis;
        white-space: nowrap;
        -webkit-box-orient: horizontal;
        -moz-box-orient: horizontal;
        -webkit-box-align: stretch;
        -moz-box-align: stretch;
        display: block;
        -webkit-justify-content: space-between;
        -moz-justify-content: space-between;
        -webkit-align-items: stretch;
        -moz-align-items: stretch;
        -webkit-flex-wrap: nowrap;
        -moz-flex-wrap: nowrap;
      }

      /* 让搜索中某些视频的阶段可以横向滚动 */
      div[class^="new-summary-container_"]{
        overflow: auto;
      }
		`,
      searchHome: `
			html,
			body,
			div#header{
				height: calc( 100vh - 120px );
			}
			form#index-form{
				position: static;
				top:0;
				right:0;
				bottom:0;
				left:0;
				margin:auto !important;
				width: 90%;
			}
			div#navs ~ div,
			#login-wraps,
			a.square-enterance,
			div#ts-image-uploader-icon,
			div.baiduappcall-wrap div.voice.call,
			div.tab_news,
			div#navs{
				display: none !important;
			}
      /* 图片logo往下移40px */
      #logo{
          padding-top: 40px;
      }
		`,
      searchBaiduHealth: `
    /* 右下角悬浮的健康直播间图标按钮 */
    div[class^='index_brandEntry']{
      display: none !important;
    }
    `,
      baijiahao: `
			.layer-wrap,
			.openImg,
			.oPadding,
			.bottomTTSStruct,
			.undefined,
			.headDeflectorContainer,
			.followSuper,
			#searchwordSdk,
			div#commentModule > div > div > span:nth-child(2),
      /* 顶部打开APP横幅 */
      #headDeflectorContainer,
      /* 展开全文 */
      .foldMaskWrapper{
				display:none !important;
			}
			body.scrollHide{
				overflow:auto !important;
			}
			.mainContent,
      #mainContentContainer{
				height:  auto !important;
			}
		`,
      tieba: `
			.tb-backflow-defensive,
			.fixed-nav-bar-defensive,
			.post-cut-guide,
			.ertiao-wrap-defensive,
			.feed-warp.gray-background,
			.pb-page-wrapper.app-view.transition-fade nav:first-child,
			.comment-box,
			.only-lz,
			.nav-bar-v2 .nav-bar-bottom,
			.more-image-desc,
			.fengchao-banner-defensive,
			.wake-app,
			.banner-wrapper-defensive,
			.open-app,
      .topic-share-page-v2 .bav-bar-top,
      /* 打开APP查看更多评论 */
      .cmt-large-cut-guide,
      /* 底部评论滚动栏 */
      div.diy-guide-wrapper{
				display:none !important;
			}
			body.tb-modal-open{
				overflow:auto !important;
			}
		`,
      wenku: `
			.reader-pop-manager-view-containter,
			.core-download,
			.card-wrap.card-vip,
			.pop-manager-view-containter,
			#carousel,
			.card-wrap,
			.n-card-wrap-exp,
			.pageNo .pager~div[class*="__wm"],
			.fold-pager,
			.vip-choice,
			.wk-bottom-btn,
			.continue-read-wrap.invite-clipboard,
			.wk-student,
			.search-pay-container,
			.wk-student-defense,
			.vip-rec-card-main,
      .back-dialog,
      div.middle-box-root{
				display:none !important;
			}
			.bartop{
				display: unset;
			}
			.reader-wrap{
				height:auto !important;
			}
			#view-rr-app{
				overflow-y:auto !important;
			}
			#view-app,
			#view-rr-app{
				max-height: 100% !important;
			}
			.top-card{
				margin-top: 10px !important;
			}
			*{
				-webkit-touch-callout: inherit !important;
				-khtml-user-select: auto !important;
				-moz-user-select: auto !important;
				-ms-user-select: auto !important;
				user-select: auto !important;
			}
		`,
      jingyan: `
			.article-feed-next,
			.wgt-rel-exp-feed,
			.article-feed-btn-fixed,
			.read-whole-mask.app,
			.asp-self-rander,
			.baobao-image-item,
			#wgt-ad-guess{
				display:none !important;
			}
			.exp-content-container{
				max-height: 100% !important;
				overflow:auto !important;
			}
		`,
      baike: `
			.BK-after-content-wrapper,
			.yitiao-container,
			.BK-content-load,
			#J-tashuo-button-fixed,
			#J-super-layer-promote,
      /* 底部的参考资料展开图标 */
      #J-reference-unfold{
				display:none !important;
			}
			#J-other-content,
      #J-reference li.reference-hide{
				display:block !important;
			}
		`,
      zhidao: `
			/* .dec + div, */
			#feed-recommend,
			.dec,
			.wgt-topic-hot,
			#respect-footer,
			#wap-youx-change-asp,
			div.question-line + div:not(.replies-container),
			.wgt-asp-youx,
			.w-detail-display-btn,
			.ask-for-friend,
			#knowledge-answer-list,
			.go-to-ask,
			div[class*='ads']{
				display:none !important;
			}
			.w-detail-container{
				max-height: 100% !important;
				overflow: auto !important;
			}
		`,
      fanyi: `
			.app-bar,
			.jifeng-container,
			.intro-title,
      .sideQrContainer,
      .inner.clearfix,
      section.bottom-intro,
      #desktop-guide-wrapper{
				display:none !important;
			}
			.new-header-dl{
				visibility: hidden;
			}
		`,
      fanyiApp: `
			.fanyi-invoke-btn,
			.top-bn{
				display:none !important;
			}
		`,
      image: `
			#boxBanner{
				display:none !important;
			}
		`,
      map: `
			.index-widget-guidebanner,
			.common-widget-bottom-banner-changeId,
			#index-areaEntry-widget,
			div.common-widget-bottom-banner-changeId,
			#downloadnativepopup,
			.xiaoduVoiceCard,
			.index-widget-guidebanner,
      #message-center-panel,
      .xiaoduVoice-banner.-border-round,
      /* 底部中间横幅-打开百度地图APP */
      #main div[id^="fis_elm"] .btn-banner-float{
				display:none !important;
			}
		`,
      mbd: `
			div.headDeflectorContainer,
      #bdrainrwDragButton,
			#page_wrapper .other div[class*='undefined'],
			#page_wrapper .other > div[class=""],
      /* 底部按钮-百度APP内播放 */
      div.common-wrap.single-pd,
      /* 顶部横幅-APP内播放 */
      div#app div.guid-new,
      /* 顶部横幅-APP内阅读 */
      #headDeflectorContainer,
      /* 底部 打开百度APP，阅读体验更佳 */
      #page_wrapper div[class^="foldMaskWrapper-"],
      /* 打开百度APP，阅读完整内容 */
      #content_wrapper .foldMaskWrapper,
      /* 影响定位元素的遮罩层 */
      #page_wrapper .bdboxshare>div:first-child,
      /* 来百度APP畅享高清图片 */
      .contentMedia .openImg{
				display: none !important;
			}
      /* 展开阅读 */
      #page_wrapper #dynamicItem,
      /* 手机版-展开阅读 */
      #mainContentContainer{
        height: auto !important;
      }
		`,
      xue: `
			.sc-dkcEsn,
			.sc-fHSyak,
			.sc-gikAfH,
			swan-view.strategy-institution-list,
			swan-view.strategy-wrapper,
			.swan-spider-tap,
			.booking,
			.head-bar,
			.head-bar-placeholder{
				display: none !important;
			}
			.sc-cHGmPC{
				width: auto !important;
			}
		`,
      aiqicha: `
      div.header-down-app,
      div.active-enter,
      div.app-enter,
      div.coupon-active,
      div.cpc-adv-container,
      div.detail-footer.detail-footer-test,
      div.index-more[data-show-id="indexMoreExposure"]
      {
        display: none !important;
      }
      .bread-crumbs.has-down,
      .border-bottom-line{
        top: 0 !important;
      }
    `,
      pos: `
      html,body{
        display: none !important;
      }`,
      haokan: `
      div.share-origin.wx-share-launch,
      div.open-app-top,
      div.open-app-bottom.wx-share-launch,
      /* 打开APP  好看更清晰(1080P) */
      .NewOpenApp,
      /* 顶部空白区域 */
      .placeholder,
      /* 底部好看视频图片 */
      .page-buttom,
      /* 暂停视频弹出来的打开百度好看视频 */
      .video-player-download-tips{
        display: none !important;
      }
      `,
      graph: `
      #app section.vf-home-booth div.vf-w-button.vf-home-booth-camera,
      #viewport .graph-imagecut-banner-invoke,
      /* 往下滑动右下角的搜索图标按钮 */
      #app .vf-home-camera{
        display: none !important;
      }
      `,
      pan: `
      /* 失败页底部广告推荐 */
      div.share-error-ad,
      /* 左侧导航栏底部下载百度网盘APP横栏 */
      #app div.download-app,
      /* 失败页-小飞机送惊喜 */
      div.errorWrap div.share-plane,
      /* 保存到网盘右上角的领红包图标 */
      img.sharelist-savebutton-hb-tip{
        display: none !important;
      }
      `,
      yiyan: `
      
      `,
      chat: `
      
      `,
      mini_jiaoyu: `
      
      `,
      easyLearn: `
      /* 中间弹窗-限时专享福利 */
      #app .pre-unpaid-wrap,
      /* 底部工具栏上面-月考全胜 您有xx元体验卡 */
      .question-bottom-bar .vip-bar,
      /* 解析-免费查看答案及解析 */
      .question-analysis-new .see-more,
      /* 最底部-百度教育商务合作、产品代理销售或内容合作等*/
      .business-el-line,
      .business-el-line-background,
      /* 展开按钮 */
      .question-analysis-new .expand{
        display: none !important;
      }
      /* 显示答案及解析 */
      .ques-title.analysis-title + div{
        display: unset !important;
      }
      .question-analysis-new .analysis-wrap,
      #analysis{
        overflow: unset !important;
        height: unset !important;
        max-height: unset !important;
      }
      /* 电脑端 */
      /* 中间弹窗-限时专享福利 */
      .kaixue-dialog-mask,
      /* 解析-免费查看答案及解析 */
      .question-cont .mask,
      /* 底部-横幅畅享百万解题视频、 千万整本试题解析VIP全场免费下 */
      .vip-banner-cont{
        display: none !important;
      }
      `,
    },
    /**
     * 百度搜索-主页
     */
    searchHome() {
      if (
        !this.url.match(/^http(s|):\/\/(m|www).baidu.com\/$/g) &&
        !this.url.match(
          /^http(s|):\/\/(m|www).baidu.com\/(\?ref=|\?tn=|\?from=)/g
        )
      ) {
        return;
      }
      GM_Menu.add({
        key: "baidu_search_home_homepage_minification",
        text: "精简主页",
        enable: true,
      });
      if (GM_Menu.get("baidu_search_home_homepage_minification")) {
        GM_addStyle(this.css.searchHome);
        log.info(
          "插入CSS规则-主页 " +
            GM_Menu.getShowTextValue("baidu_search_home_homepage_minification")
        );
      }
    },
    /**
     * 百度搜索
     */
    search() {
      if (!this.url.match(/^http(s|):\/\/(m|www).baidu.com\/.*/g)) {
        return;
      }

      const handleItemURL = {
        /**
         * 是否显示 重 图标
         */
        showIsDirectIcon: false,
        originURLMap: null,
        /**
         * 判断链接是否是百度的中转链接
         * @param {string} url
         * @returns {boolean}
         * + true 是百度的中转链接
         * + false 不是百度的中转链接
         */
        isBaiDuTransferStation(url) {
          url = decodeURIComponent(url);
          return url.startsWith("https://m.baidu.com/from");
        },
        /**
         * 判断链接是否是黑名单链接，不进行处理
         * @param {string} url
         * @returns {boolean}
         * + true 是黑名单url
         * + false 不是黑名单url
         */
        isBlackList(url) {
          let blackList = [
            new RegExp("^http(s|)://m.baidu.com/productcard", "g"),
            new RegExp("^http(s|)://ks.baidu.com"),
          ];
          let flag = false;
          for (let index = 0; index < blackList.length; index++) {
            let blackUrlRegexp = blackList[index];
            if (url.match(blackUrlRegexp)) {
              flag = true;
              break;
            }
          }
          return flag;
        },
        /**
         * 为搜索结果每一条设置原始链接
         * @param {Element} targetNode
         * @param {string} articleURL article的真实url
         */
        setArticleOriginUrl(targetNode, articleURL) {
          /* 处理超链接 */
          targetNode.querySelectorAll("a").forEach(async (item) => {
            if (handleItemURL.originURLMap.has(item.href)) {
              articleURL = handleItemURL.originURLMap.get(item.href);
            }
            let domOriginUrl = handleItemURL.parseDOMAttrOriginUrl(item);
            if (!utils.isNull(domOriginUrl)) {
              articleURL = domOriginUrl;
            }
            if (utils.isNull(articleURL) || articleURL === item.href) {
              return;
            }
            if (handleItemURL.isBlackList(articleURL)) {
              return;
            }
            item.href = articleURL;
            log.info("替换成新链接: " + articleURL);
          });
          /* 这个是百度笔记(可能) */
          targetNode
            .querySelectorAll("div[data-aftclk][class*=img-container]")
            .forEach((item) => {
              let domOriginUrl = handleItemURL.parseDOMAttrOriginUrl(item);
              if (
                !utils.isNull(domOriginUrl) &&
                !handleItemURL.isBlackList(domOriginUrl)
              ) {
                item.setAttribute("href", domOriginUrl);
                item.setAttribute("rl-link-href", domOriginUrl);
                log.info("替换成新链接2: " + domOriginUrl);
              }
            });
          /* 对搜索结果中存在的视频进行处理 */
          targetNode
            .querySelectorAll("div.c-video-container div[data-aftclk]")
            .forEach((item) => {
              let domOriginUrl = handleItemURL.parseDOMAttrOriginUrl(item);
              if (
                !utils.isNull(domOriginUrl) &&
                !handleItemURL.isBlackList(domOriginUrl)
              ) {
                item.setAttribute("href", domOriginUrl);
                item.setAttribute("rl-link-href", domOriginUrl);
                log.info("视频替换成新链接1: " + domOriginUrl);
              }
            });
          /* 对搜索结果中存在的视频进行处理 */
          targetNode
            .querySelectorAll('div[data-module="sc_pc"] div[rl-link-href]')
            .forEach((item) => {
              let domOriginUrl = handleItemURL.parseDOMAttrOriginUrl(item);
              if (
                !utils.isNull(domOriginUrl) &&
                !handleItemURL.isBlackList(domOriginUrl)
              ) {
                item.setAttribute("href", domOriginUrl);
                item.setAttribute("rl-link-href", domOriginUrl);
                log.info("视频替换成新链接2: " + domOriginUrl);
              }
            });
        },
        /**
         * 解析在JSON数据中的urlParams中真正的链接，如果不存在，返回undefined
         * @param {object} data 传入 {"urlParams":{...}} 中的urlParams
         * @returns {?string}
         */
        parseURLParamsOriginURL(data) {
          if (data["originUrl"]) {
            return data["originUrl"];
          } else if (data["log"]) {
            /* 隐藏在log的mu中 */
            let url = undefined;
            try {
              url = utils.toJSON(data["log"])["mu"];
              utils.isNull(url) && (url = undefined);
            } catch (error) {}
            return url;
          }
        },
        /**
         * 由于部分真实链接存储在 script 标签中，得取出
         * @param {Element} targetNode 目标元素
         * @returns {Map}
         */
        parseScriptDOMOriginUrlMap(targetNode) {
          let urlMap = new utils.Dictionary();
          targetNode
            .querySelectorAll("script[id^='atom-data-']")
            .forEach((item) => {
              let jsonData = utils.toJSON(item.innerHTML);
              if (jsonData["data"]["resultAtomData"] == null) {
                return;
              }
              let resultAtomData = jsonData["data"]["resultAtomData"];
              if (
                resultAtomData["abstract"] &&
                resultAtomData["abstract"]["urlParams"] &&
                resultAtomData["abstract"]["urlParams"]["tcUrl"]
              ) {
                let url = handleItemURL.parseURLParamsOriginURL(
                  resultAtomData["abstract"]["urlParams"]
                );
                if (url) {
                  urlMap.set(
                    resultAtomData["abstract"]["urlParams"]["tcUrl"],
                    url
                  );
                }
              }
              if (
                resultAtomData["content"] &&
                resultAtomData["content"]["abstract"] &&
                resultAtomData["content"]["abstract"]["urlParams"] &&
                resultAtomData["content"]["abstract"]["urlParams"]["tcUrl"]
              ) {
                let url = handleItemURL.parseURLParamsOriginURL(
                  resultAtomData["content"]["abstract"]["urlParams"]
                );
                if (url) {
                  urlMap.set(
                    resultAtomData["content"]["abstract"]["urlParams"]["tcUrl"],
                    url
                  );
                }
              }
              if (
                resultAtomData["content"] &&
                resultAtomData["content"]["links"] &&
                resultAtomData["content"]["links"]["list"]
              ) {
                resultAtomData["content"]["links"]["list"].forEach((item) => {
                  item.forEach((item2) => {
                    if (item2["urlParams"]["tcUrl"]) {
                      let url = handleItemURL.parseURLParamsOriginURL(
                        item2["urlParams"]
                      );
                      if (url) {
                        urlMap.set(item2["urlParams"]["tcUrl"], url);
                      }
                    }
                  });
                });
              }
              if (
                resultAtomData["content"] &&
                resultAtomData["content"]["site"]
              ) {
                resultAtomData["content"]["site"]["list"].forEach((item) => {
                  if (item["urlParams"]["tcUrl"]) {
                    let url = handleItemURL.parseURLParamsOriginURL(
                      item["urlParams"]
                    );
                    if (url) {
                      urlMap.set(item["urlParams"]["tcUrl"], url);
                    }
                  }
                });
              }
            });
          return urlMap;
        },
        /**
         * 解析DOM节点上隐藏在属性中的真正url
         * @param {Element} targetNode
         * @returns {?string}
         */
        parseDOMAttrOriginUrl(targetNode) {
          let url = null;
          let dataLog = targetNode.getAttribute("data-log");
          if (dataLog) {
            try {
              dataLog = utils.toJSON(dataLog);
              url = dataLog.mu;
            } catch (error) {
              log.error("DOM的属性data-log不存在👇");
              log.error(error);
            }
          }
          if (utils.isNull(url)) {
            let dataIVK = targetNode.getAttribute("data-ivk");
            if (dataIVK) {
              try {
                dataIVK = utils.toJSON(dataIVK);
                if (
                  dataIVK?.control?.default_url &&
                  !handleItemURL.isBaiDuTransferStation(
                    dataIVK?.control?.default_url
                  )
                ) {
                  url = dataIVK?.control?.default_url;
                } else if (
                  dataIVK?.control?.dataUrl &&
                  !handleItemURL.isBaiDuTransferStation(
                    dataIVK?.control?.dataUrl
                  )
                ) {
                  url = dataIVK?.control?.dataUrl;
                } else if (
                  dataIVK?.control?.ext?.url &&
                  !handleItemURL.isBaiDuTransferStation(
                    dataIVK?.control?.ext?.url
                  )
                ) {
                  url = dataIVK?.control?.ext?.url;
                }
              } catch (error) {
                log.error("DOM的属性data-ivk不存在👇");
                log.error(error);
              }
            }
          }

          if (utils.isNull(url)) {
            let rlLinkDataLog = targetNode.getAttribute("rl-link-data-log");
            if (rlLinkDataLog) {
              try {
                rlLinkDataLog = utils.toJSON(rlLinkDataLog);
                if (utils.isNull(rlLinkDataLog.mu) && rlLinkDataLog.extra) {
                  try {
                    let rlLinkDataLogExtra = utils.toJSON(rlLinkDataLog.extra);
                    if (
                      rlLinkDataLogExtra.loc &&
                      !handleItemURL.isBaiDuTransferStation(
                        rlLinkDataLogExtra.loc
                      )
                    ) {
                      url = decodeURIComponent(rlLinkDataLogExtra.loc);
                    } else if (
                      rlLinkDataLogExtra.log_loc &&
                      !handleItemURL.isBaiDuTransferStation(
                        rlLinkDataLogExtra.log_loc
                      )
                    ) {
                      url = decodeURIComponent(rlLinkDataLogExtra.log_loc);
                    }
                  } catch (error) {
                    log.error("DOM的属性rl-link-data-log的extra不存在👇");
                    log.error(error);
                  }
                } else {
                  url = rlLinkDataLog.mu;
                }
              } catch (error) {
                log.error("DOM的属性rl-link-data-log不存在👇");
                log.error(error);
              }
            }
          }

          if (utils.isNull(url)) {
            let rlLinkDataIvk = targetNode.getAttribute("rl-link-data-ivk");
            if (rlLinkDataIvk) {
              try {
                rlLinkDataIvk = utils.toJSON(rlLinkDataIvk);
                if (
                  rlLinkDataIvk?.control?.default_url &&
                  !handleItemURL.isBaiDuTransferStation(
                    rlLinkDataIvk?.control?.default_url
                  )
                ) {
                  url = rlLinkDataIvk?.control?.default_url;
                } else if (
                  rlLinkDataIvk?.control?.invoke_url &&
                  !handleItemURL.isBaiDuTransferStation(
                    rlLinkDataIvk?.control?.invoke_url
                  )
                ) {
                  url = rlLinkDataIvk?.control?.invoke_url;
                } else if (
                  rlLinkDataIvk?.control?.ext?.url &&
                  !handleItemURL.isBaiDuTransferStation(
                    rlLinkDataIvk?.control?.ext?.url
                  )
                ) {
                  url = rlLinkDataIvk?.control?.ext?.url;
                }
              } catch (error) {
                log.error("DOM的属性rl-link-data-ivk不存在👇");
                log.error(error);
              }
            }
          }

          if (utils.isNull(url)) {
            let articleDataLog = targetNode
              .querySelector("article")
              ?.getAttribute("rl-link-data-log");
            if (articleDataLog) {
              try {
                articleDataLog = utils.toJSON(articleDataLog);
                url = articleDataLog.mu;
              } catch (error) {
                log.error("article DOM的属性的rl-link-data-log不存在👇");
                log.error(targetNode);
              }
            }
          }
          if (utils.isNull(url)) {
            let articleLinkDataIVK = targetNode
              .querySelector("article")
              ?.getAttribute("rl-link-data-ivk");
            if (articleLinkDataIVK) {
              try {
                articleLinkDataIVK = utils.toJSON(articleLinkDataIVK);
                if (
                  articleLinkDataIVK?.control?.default_url &&
                  !handleItemURL.isBaiDuTransferStation(
                    articleLinkDataIVK?.control?.default_url
                  )
                ) {
                  url = articleLinkDataIVK?.control?.default_url;
                } else if (
                  articleLinkDataIVK?.control?.dataUrl &&
                  !handleItemURL.isBaiDuTransferStation(
                    articleLinkDataIVK?.control?.dataUrl
                  )
                ) {
                  url = articleLinkDataIVK?.control?.dataUrl;
                }
              } catch (error) {
                log.error("article DOM的属性rl-link-data-ivk不存在👇");
                log.error(error);
              }
            }
          }

          if (utils.isNull(url)) {
            url = null;
            /* log.error(["未在元素节点中找到隐藏的原始URL", jQDOM]); */
          } else {
            /* 对每个中文字符进行编码 */
            let chineseArr = url.match(/[\u4e00-\u9fa5]/g);
            if (chineseArr) {
              for (let i = 0; i < chineseArr.length; i++) {
                url = url.replace(chineseArr[i], encodeURI(chineseArr[i]));
              }
            }
          }

          if (utils.isNull(url)) {
            /* 最新资讯上的隐藏的链接 */
            let labelUrl = targetNode.getAttribute("label-url");
            if (labelUrl) {
              url = labelUrl;
            }
          }
          /* 因为链接中存在%25，需要正确替换成% */
          if (!utils.isNull(url) && url.startsWith("https://m.baidu.com/sf?")) {
            url = decodeURIComponent(url);
            /* url = url.replaceAll("%25","%") */
          }
          /* 有些url是错误的， */
          if (utils.isNotNull(url)) {
            if (
              url.startsWith("http://nourl.baidu.com") ||
              url.startsWith("https://nourl.baidu.com")
            ) {
              url = "";
            }
          }
          return url;
        },
        /**
         * 获取每一项的标题元素
         * @param {Element} targetNode 目标项
         * @returns {?Element}
         */
        getItemTitleElement(targetNode) {
          return (
            targetNode.querySelector(".c-title-text") ||
            targetNode.querySelector("p.cu-title") ||
            targetNode.querySelector("div[class^=header-wrapper]") ||
            targetNode.querySelector(".c-title")
          );
        },
        /**
         * 添加CSDN的CSS
         */
        addCSDNFlagCSS() {
          GM_addStyle(`
          .csdn-flag-component-box{display:flex;margin:0;text-align:left;font-size:0;position:relative;width:260px;margin:5px 0}
          .csdn-flag-component-box a{display:inline-block;font-size:14px}
          .csdn-flag-component-box .praise {
              padding-right: 20px;
              background: #ff5722;
              border-top-left-radius: 50px;
              border-top-right-radius: 50px;
              border-bottom-left-radius: 50px;
              border-bottom-right-radius: 50px;
              background: -webkit-linear-gradient(left,#ff5722,#f78d6b);
              background: -o-linear-gradient(right,#ff5722,#f78d6b);
              background: -moz-linear-gradient(right,#ff5722,#f78d6b);
              background: linear-gradient(to right,#ff5722,#f78d6b);
          }
          .csdn-flag-component-box .praise,
          .csdn-flag-component-box .share {
              height:auto;
              line-height:normal;
              color: #fff;
              background: #ff0505;
              border-radius: 5px;
              padding: 2px 4px;
          }`);
        },
        /**
         * 给元素添加【CSDN】下载标识
         * @param {Element} targetNode
         */
        addCSDNFlag(targetNode) {
          if (targetNode.querySelector(".csdn-flag-component-box")) {
            return;
          }
          let title_text_element =
            handleItemURL.getItemTitleElement(targetNode);
          if (title_text_element) {
            DOMUtils.append(
              title_text_element,
              `<div class="csdn-flag-component-box"><a class="praise" href="javascript:;">CSDN下载</a></div>`
            );
            log.success("插入CSDN下载提示标题");
          }
        },
        /**
         * 移除广告、推广
         */
        removeAds() {
          if (
            GM_Menu.get("baidu_search_blocking_everyone_is_still_searching")
          ) {
            let pageRelativeElement =
              document.querySelectorAll("#page-relative");
            if (pageRelativeElement.length) {
              log.success(
                `删除广告位 ==> 末尾 大家都在搜 ${pageRelativeElement.length}个`
              );
              DOMUtils.remove(pageRelativeElement);
            }
            let centerRecommandWarpperElement = document.querySelectorAll(
              ".c-recomm-wrap.new-ux-recom-wrapper.c-bg-color-white.animation"
            );
            if (centerRecommandWarpperElement.length) {
              log.success(
                `删除广告位 ==> 中间 大家都在搜 ${centerRecommandWarpperElement.length}个`
              );
              DOMUtils.remove(centerRecommandWarpperElement);
            }
            let relativewordsElement =
              document.querySelectorAll("#relativewords");
            if (relativewordsElement.length) {
              log.success(
                `删除广告位 ==> 简单搜索加载下一页出现的 大家都在搜 ${relativewordsElement.length}个`
              );
              DOMUtils.remove(relativewordsElement);
            }
          } else {
            if (handleEveryOneSearch.refactorEveryoneIsStillSearching) {
              handleEveryOneSearch.handleBottom(
                document.querySelectorAll("#page-relative")
              );
              handleEveryOneSearch.handleCenter(
                document.querySelectorAll(
                  '.c-result.result[tpl^="recommend_list"]'
                )
              );
            }
          }
          let popUpElement = document.querySelectorAll("#pop-up");
          if (popUpElement.length) {
            log.success(`删除 ==> 跳转百度app提示 ${popUpElement.length}个`);
            DOMUtils.remove(popUpElement);
          }
          let ecWiseAdElement = document.querySelectorAll(".ec_wise_ad");
          if (ecWiseAdElement.length) {
            log.success(
              `删除 ==> 顶部的部分商品广告 ${ecWiseAdElement.length}个`
            );
            DOMUtils.remove(DOMUtils.parent(ecWiseAdElement));
          }

          document.querySelectorAll(".c-result.result").forEach((item) => {
            let dataLog = utils.toJSON(
              item.getAttribute("data-log")
            ); /* 获取属性上的LOG */
            let searchArticleOriginal_link = dataLog["mu"]; /* 真实链接 */
            if (
              GM_Menu.get("baidu_search_blocking_everyone_is_still_searching")
            ) {
              if (
                searchArticleOriginal_link.match(/recommend_list.baidu.com/g) ||
                item.getAttribute("tpl") === "recommend_list"
              ) {
                item?.remove();
                log.success("删除广告 ==> 大家还在搜");
              }
              if (item.textContent.substring(0, 5) === "大家还在搜") {
                item?.remove();
                log.success("删除广告 ==> 大家都在搜（能看到的）");
              }
              document.querySelectorAll("span").forEach((item) => {
                let resultParentElement = item.parentElement.parentElement;
                if (
                  item.innerText.match(/百度APP内打开/) ||
                  resultParentElement.getAttribute("data-from") === "etpl"
                ) {
                  resultParentElement.remove();
                  log.success(
                    "删除广告 ==> 百度APP内打开，隐藏的广告，会在滚动时跳出来的"
                  );
                }
              });
            }
            /* 这个是必须删除的，点击搜索结果却跳出来除了影响心情没有一点用 */
            if (item.querySelector(".c-atom-afterclick-recomm-wrap")) {
              item.querySelector(".c-atom-afterclick-recomm-wrap")?.remove();
              log.success("删除广告 ==> 大家还在搜:隐藏的(点击后，跳出来的)");
            }
            let bottomLogoElement =
              item.querySelectorAll(".c-color-source"); /* 底部标识 */
            if (bottomLogoElement.length) {
              bottomLogoElement.forEach((_item_) => {
                if (_item_.outerText.match(/百度(APP内打开|手机助手)/)) {
                  item.remove();
                  log.success("删除广告 ==> 百度APP内打开|百度手机助手");
                }
              });
            }

            if (
              searchArticleOriginal_link.match(
                /^http(s|):\/\/(download.csdn.net|www.iteye.com\/resource)/g
              )
            ) {
              handleItemURL.addCSDNFlag(item);
            }
            if (item.getAttribute("srcid")?.match(/(sigma|vid_fourfold)/g)) {
              item.remove();
              log.success("删除推荐 ==> xxx 相关 xxx");
            }
            if (
              searchArticleOriginal_link.match(/expert.baidu.com/g) &&
              GM_Menu.get("baidu_search_shield_baidu_health")
            ) {
              item?.remove();
              log.success("删除广告 ==> 百度健康");
            }
            if (searchArticleOriginal_link.match(/author.baidu.com\/home\//g)) {
              item?.remove();
              log.success("删除广告 ==> 百家号聚合");
            }
            if (dataLog["ensrcid"] == "wenda_inquiry") {
              item?.remove();
              log.success("删除广告 ==> 问一问");
            }
          });
        },
        /**
         * 重定向顶部的链接，如全部、视频、图片、贴吧、咨询...
         */
        redirectTopLink() {
          document.querySelectorAll(".se-head-tablink a").forEach((item) => {
            if (
              item.hasAttribute("data-sflink") &&
              !utils.isNull(item.getAttribute("data-sflink")) &&
              handleItemURL.isBaiDuTransferStation(item.getAttribute("href")) &&
              item.getAttribute("href") !== item.getAttribute("data-sflink")
            ) {
              /* log.success(
                "重定向顶部按钮: " + item.outerText.trim(),
                "#ba00f8"
              ); */
              item.href = item.getAttribute("data-sflink");
            }
          });
        },
        /**
         * 删除script标签中的百度APP提示
         */
        replaceScriptBaiDuTip() {
          document.querySelectorAll("script").forEach((item) => {
            if (
              item.innerText.match(/define\(\"@molecule\/aftclk\/index\",/g)
            ) {
              item.remove();
              log.success("删除广告 ==> script元素 跳转百度app提示");
            }
          });
        },
        /**
         * 替换链接
         * @returns {Promise}
         */
        async replaceLink() {
          let searchResultList = Array.from(
            document.querySelectorAll(".c-result.result")
          );
          for (const searchResultIndex in searchResultList) {
            let item = searchResultList[searchResultIndex];
            let resultItemOriginURL =
              handleItemURL.parseDOMAttrOriginUrl(
                item
              ); /* 根据已获取的真实链接取值 */
            if (utils.isNull(resultItemOriginURL)) {
              /* 未取到值 */
              continue;
            }
            let articleElement = item.querySelector("article");
            /* 不处理没有article标签的元素 */
            if (!articleElement) {
              continue;
            }
            /* 不对黑名单链接进行处理 */
            if (handleItemURL.isBlackList(resultItemOriginURL)) {
              log.error("黑名单链接不进行替换👉" + resultItemOriginURL);
              continue;
            }
            if (
              !resultItemOriginURL.match(/^http(s|):\/\/m.baidu.com\/from/g)
            ) {
              if (
                handleItemURL.showIsDirectIcon &&
                !item.querySelector(".white-bdsearch-isredirecrt")
              ) {
                let title_text_element =
                  handleItemURL.getItemTitleElement(item);
                let is_redirect_icon = document.createElement("div");
                is_redirect_icon.className = "white-bdsearch-isredirecrt";
                is_redirect_icon.innerHTML = "<span>重</span>";
                title_text_element.insertBefore(
                  is_redirect_icon,
                  title_text_element.firstChild
                );
              }
            }
            if (
              item.getAttribute("tpl") === "wenda_abstract" &&
              item.getAttribute("preventClick") == null
            ) {
              /* 该item为搜索智能生成该为点击该块，获取url进行跳转 */
              item.setAttribute("preventClick", "true");
              DOMUtils.on(item, "click", function (event) {
                utils.preventEvent(event);
                let clickNode = event.target;
                if (
                  clickNode.localName &&
                  clickNode.localName === "sup" &&
                  clickNode.getAttribute("rl-type") === "stop"
                ) {
                  return;
                } else {
                  window.stop();
                  window.location.href = decodeURI(resultItemOriginURL);
                }
              });
              continue;
            }

            /* 视频 */
            if (
              resultItemOriginURL.match(
                /^http(s|):\/\/www.internal.video.baidu.com/g
              )
            ) {
              let internalVideo = decodeURI(
                articleElement.getAttribute("rl-link-data-log")
              );
              let internalVideoMatch = internalVideo.match(
                /\/sf\?pd=video_pag(.*?)={/g
              );
              if (internalVideoMatch) {
                internalVideoMatch = internalVideoMatch[0];
                let newinternalVideo = internalVideoMatch.substring(
                  0,
                  internalVideoMatch.length - 2
                );
                resultItemOriginURL = newinternalVideo;
                log.info(`视频链接 ${newinternalVideo}`);
              }
            }
            /* 替换链接 */
            handleItemURL.setArticleOriginUrl(item, resultItemOriginURL);
            articleElement.setAttribute("rl-link-href", resultItemOriginURL);
          }
        },
        /**
         * 替换链接-vsearch
         */
        replaceVSearchLink() {
          document
            .querySelectorAll("#realtime-container  div:not([class])")
            .forEach((element) => {
              let linkElement = element.querySelector("a");
              if (linkElement.hasAttribute("data-sf-visited")) {
                let dataSfVisited = linkElement.getAttribute("data-sf-visited");
                if (dataSfVisited !== linkElement.href) {
                  linkElement.href = dataSfVisited;
                  log.success("替换链接  " + dataSfVisited);
                }
              }
            });
        },
      };

      const handleEveryOneSearch = {
        /**
         * 是否重构大家都在搜
         */
        refactorEveryoneIsStillSearching: false,
        /**
         * 处理底部的
         * @param {NodeList} bottomElement
         */
        handleBottom(bottomElement) {
          bottomElement.forEach((item) => {
            if (item.hasAttribute("gm-refactor-everyone-search-bottom")) {
              return;
            }
            item.removeAttribute("class");
            item.removeAttribute("id");
            item.setAttribute("gm-refactor-everyone-search-bottom", true);
            item
              .querySelectorAll(".rw-list-container .rw-list-new")
              .forEach((searchItemEle) => {
                let searchText = searchItemEle.textContent.trim();
                searchItemEle.innerHTML = `
                <a href="javascript:;" onclick="return false;" target="_self" class="whitesev-gm-refactor-everyone-searching">
                  <span>${searchText}</span>
                </a>`;
                searchItemEle.style.setProperty("padding", "0.06rem");
              });
            item.querySelector("div.c-line-clamp1")?.remove();
            if (!item.closest("#results")) {
              document.querySelector("#results").appendChild(item);
            }
            DOMUtils.on(item, "click", "div.rw-list-new", function (event) {
              let searchText = event.target
                .querySelector("span")
                .textContent.trim();
              log.success("底部 点击大家还在搜 ==> " + searchText);
              utils.preventEvent(event);
              window.location.href = `https://m.baidu.com/s?word=${event.target.textContent.trim()}`;
            });
          });
        },
        /**
         * 处理中间的
         * @param {NodeList} centerElement
         */
        handleCenter(centerElement) {
          centerElement.forEach((recommendElement) => {
            if (
              recommendElement.hasAttribute(
                "gm-refactor-everyone-search-center"
              )
            ) {
              return;
            }
            if (
              !recommendElement.querySelector("div.c-gap-inner-bottom-small") &&
              !recommendElement.querySelector("div.cos-row div.cos-col")
            ) {
              return;
            }
            recommendElement.setAttribute(
              "gm-refactor-everyone-search-center",
              true
            );
            let rwListContainerHTML = "";
            let innerBottomSmallElementList = recommendElement.querySelectorAll(
              "div.c-gap-inner-bottom-small"
            );
            if (!innerBottomSmallElementList.length) {
              innerBottomSmallElementList = recommendElement.querySelectorAll(
                "div.cos-row div.cos-col"
              );
            }
            innerBottomSmallElementList.forEach((item) => {
              let searchText = item.textContent.trim();
              rwListContainerHTML += `
              <div class="rw-list-new rw-list-new2" style="padding: 0.06rem;width: 49%;">
                <a href="javascript:;" onclick="return false;" target="_self" class="whitesev-gm-refactor-everyone-searching">
                  <span>${searchText}</span>
                </a>
              </div>`;
            });
            recommendElement.innerHTML = `
            <div m-service="relative" data-tpl="san" id="relativewords" class="se-relativewords c-container se-relativewords-new c-bg-color-white">
              <div class="rw-little-title">
                <div class="c-row">
                  <div class="c-color little-title c-span10 c-row-youth c-row-gap-zero-two-youth c-fwb">大家还在搜</div>
                  <div class="func-btn">
                    <div class="func-btn-bg"><i class="c-icon c-color-gray"></i></div>
                  </div>
                </div>
              </div>
              <div class="rw-list-container rw-list-container2" style="
              display: inline-table;display: -webkit-inline-box;
          ">${rwListContainerHTML}</div>
            </div>`;
            DOMUtils.on(
              recommendElement,
              "click",
              "div.rw-list-new",
              function (event) {
                let searchText = event.target
                  .querySelector("span")
                  .textContent.trim();
                log.success("中间 点击大家还在搜 ==> " + searchText);
                utils.preventEvent(event);
                window.location.href = `https://m.baidu.com/s?word=${searchText}`;
              }
            );
          });
        },
      };

      /* unsafeWindow.handleItemURL = handleItemURL; */
      /**
       * 点击输入框，输入其它文字，有提示，禁止百度篡改，且极大地增加搜索速度
       */
      const handleInputEvent = {
        run() {
          let suggestListSelector = "#se-box .suggest-content";
          let suggestListBtnSelectorList = "#se-box .suggest-content button";
          let suggestList2Selector = "#se-box2 .suggest-content";
          let suggestListBtn2SelectorList = "#se-box2 .suggest-content button";
          let suggestList_HOME_Selector = "#index-box .suggest-content";
          let suggestListBtn_HOME_SelectorList =
            "#index-box .suggest-content button";
          let searchInputSelector = "#kw";
          let searchInput2Selector = "#kw2";
          let searchBtnSelector = "#se-bn";
          let searchBtn2Selector = "#se-bn2";
          let searchInput_HOME_Selector = "#index-kw";
          let searchBtn_HOME_Selector = "#index-bn";
          /* 顶部搜索输入框点击后的搜索建议 */
          utils.waitNode(suggestListSelector).then((element) => {
            utils.mutationObserver(element, {
              callback: () => {
                handleInputEvent.mutationObserverFunction(
                  suggestListBtnSelectorList
                );
              },
              config: { childList: true, attributes: true },
            });
          });
          /* 底部搜索输入框点击后的搜索建议 */
          utils.waitNode(suggestList2Selector).then((element) => {
            utils.mutationObserver(element, {
              callback: () => {
                handleInputEvent.mutationObserverFunction(
                  suggestListBtn2SelectorList
                );
              },
              config: { childList: true, attributes: true },
            });
          });
          /* 百度主页的搜索输入框点击后的搜索建议 */
          utils.waitNode(suggestList_HOME_Selector).then((element) => {
            utils.mutationObserver(element, {
              callback: () => {
                handleInputEvent.mutationObserverFunction(
                  suggestListBtn_HOME_SelectorList
                );
              },
              config: { childList: true, attributes: true },
            });
          });
          /* 顶部搜索按钮 */
          DOMUtils.on(searchBtnSelector, "click", function (event) {
            return handleInputEvent.searchBtnJump(
              event,
              document.querySelector(searchInputSelector)
            );
          });
          /* 顶部搜索输入框 */
          DOMUtils.on(searchInputSelector, "keydown", function (event) {
            return handleInputEvent.enterKeyDownEvent(
              event,
              document.querySelector(searchInputSelector)
            );
          });
          /* 底部搜索按钮 */
          DOMUtils.on(searchBtn2Selector, "click", function (event) {
            return handleInputEvent.searchBtnJump(
              event,
              document.querySelector(searchInput2Selector)
            );
          });
          /* 底部部搜索输入框 */
          DOMUtils.on(
            document.querySelector(searchInput2Selector),
            "keydown",
            function (event) {
              return handleInputEvent.enterKeyDownEvent(
                event,
                document.querySelector(searchInput2Selector)
              );
            }
          );
          /* 百度主页搜索按钮 */
          DOMUtils.on(searchBtn_HOME_Selector, "click", function (event) {
            return handleInputEvent.searchBtnJump(
              event,
              document.querySelector(searchInput_HOME_Selector)
            );
          });
          /* 百度主页搜索输入框 */
          DOMUtils.on(searchInput_HOME_Selector, "keydown", function (event) {
            return handleInputEvent.enterKeyDownEvent(
              event,
              document.querySelector(searchInput_HOME_Selector)
            );
          });
        },
        /**
         * 设置搜索建议自定义click事件
         * @param {string} elementSelector
         */
        mutationObserverFunction(elementSelector) {
          log.success("设置搜索建议自定义click事件");
          document.querySelectorAll(elementSelector).forEach((item) => {
            DOMUtils.on(item, "click", function (event) {
              utils.preventEvent(event);
              window?.stop();
              let searchText = event.target.textContent;
              let redirectURL =
                window.location.origin + "/s?word=" + searchText;
              log.success("点击按钮跳转搜索 -> " + searchText);
              log.success(redirectURL);
              window.location.href = redirectURL;
              return false;
            });
          });
        },
        /**
         * 搜索按钮点击跳转
         * @param {Event} event
         * @param {Element} searchInputElement
         * @returns
         */
        searchBtnJump(event, searchInputElement) {
          utils.preventEvent(event);
          window?.stop();
          let redirectURL =
            window.location.origin + "/s?word=" + searchInputElement.value;
          log.success("点击按钮跳转搜索 -> " + searchInputElement.value);
          log.success(redirectURL);
          window.location.href = redirectURL;
          return false;
        },
        /**
         * 判决回车搜索事件
         * @param {Event} event
         * @param {Element} searchInputElement
         * @returns
         */
        enterKeyDownEvent(event, searchInputElement) {
          if (event.keyCode === 108 || event.keyCode === 13) {
            window?.stop();
            utils.preventEvent(event);
            let redirectURL =
              window.location.origin + "/s?word=" + searchInputElement.value;
            log.success("回车键跳转搜索 -> " + searchInputElement.value);
            log.success(redirectURL);
            window.location.href = redirectURL;
            return false;
          }
          return true;
        },
      };

      /**
       * 自动加载下一页
       */
      const handleNextPage = {
        /**
         * 滚动事件对象
         */
        scrollLockFunction: null,
        /**
         * 当前页
         */
        currentPage: 1,
        init() {
          this.initPageLineCSS();
          this.scrollLockFunction = new utils.LockFunction(
            this.scrollEvent,
            this
          );
          loadingView.initLoadingView();
          loadingView.hide();
          DOMUtils.after(
            document.querySelector("#page-controller"),
            loadingView.getLoadingViewElement()
          );
          this.setNextPageScrollListener();
        },
        /**
         * 设置滚动事件
         */
        setNextPageScrollListener() {
          document.addEventListener("scroll", this.scrollLockFunction.run);
        },
        /**
         * 移除滚动事件
         */
        removeNextPageScrollListener() {
          document.removeEventListener("scroll", this.scrollLockFunction.run);
          log.info("取消绑定scroll", "#f400ff");
        },
        /**
         * 滚动事件
         * @async
         */
        async scrollEvent() {
          if (!utils.isNearBottom(window.innerHeight / 3)) {
            return;
          }
          loadingView.show();
          let nextPageUrl =
            document.querySelector(".new-nextpage")?.getAttribute("href") ||
            document.querySelector(".new-nextpage-only")?.getAttribute("href");
          if (!nextPageUrl) {
            log.info("获取不到下一页，怀疑已加载所有的搜索结果");
            handleNextPage.removeNextPageScrollListener();
            loadingView.destory();
            return;
          }
          let params_pn = new URL(nextPageUrl).search.match(/[0-9]+/);
          log.info(
            `正在请求${
              params_pn.length === 0
                ? "第 10 条"
                : "第 " + parseInt(params_pn[0]) + " 条"
            }数据: ${nextPageUrl}`
          );
          handleNextPage.currentPage = parseInt(params_pn[0] / 10);
          loadingView.setText("Loading...", true);
          let getResp = await httpx.get({
            url: nextPageUrl,
            headers: {
              "User-Agent": utils.getRandomAndroidUA(),
            },
          });
          let respData = getResp.data;
          if (getResp.status) {
            log.success("响应的finalUrl: " + respData["finalUrl"]);
            loadingView.hide();
            let nextPageHTMLNode = DOMUtils.parseHTML(
              respData.responseText,
              true,
              true
            );
            let scriptAtomData = DOMUtils.createElement("div");
            nextPageHTMLNode
              .querySelectorAll("script[id^=atom-data]")
              .forEach((item) => {
                scriptAtomData.appendChild(item);
              });
            let nextPageScriptOriginUrlMap =
              handleItemURL.parseScriptDOMOriginUrlMap(scriptAtomData);
            log.info(["下一页的网址Map", nextPageScriptOriginUrlMap.items]);
            handleItemURL.originURLMap.concat(nextPageScriptOriginUrlMap);

            nextPageHTMLNode
              .querySelectorAll("style[data-vue-ssr-id]")
              .forEach((item) => {
                /* 插入vue打包的css需重新引入 */
                let dataVueSsrId = "data-vue-ssr-id";
                let dataVueSsrIdValue = item.getAttribute(dataVueSsrId);
                if (
                  utils.isNull(dataVueSsrIdValue) ||
                  !document.querySelector(
                    `style[data-vue-ssr-id="${dataVueSsrIdValue}"]`
                  )
                ) {
                  let cssDOM = GM_addStyle(item.innerHTML);
                  cssDOM.setAttribute("data-vue-ssr-id", dataVueSsrIdValue);
                  log.info(["插入Vue的CSS", cssDOM]);
                }
              });

            let searchResultDOM =
              nextPageHTMLNode.querySelectorAll(".c-result.result");
            let nextPageControllerDOM =
              nextPageHTMLNode.querySelector("#page-controller");
            let currentResultsDOM = document.querySelector("#results");
            if (nextPageControllerDOM) {
              /* 用于划分显示分页 */
              currentResultsDOM.appendChild(
                handleNextPage.getPageLineElement(handleNextPage.currentPage)
              );
              /* 每一条搜索结果拼接在后面 */
              searchResultDOM.forEach((item) => {
                currentResultsDOM.appendChild(item);
              });
              DOMUtils.html(
                document.querySelector("#page-controller"),
                nextPageControllerDOM.innerHTML
              );
            } else {
              log.info("已加载所有的搜索结果");
              handleNextPage.removeNextPageScrollListener();
            }
            if (GM_Menu.get("baidu_search_sync_next_page_address")) {
              window.history.pushState("forward", null, nextPageUrl);
            }
            /* 处理下一页的【大家还在搜】 */
            if (handleEveryOneSearch.refactorEveryoneIsStillSearching) {
              handleEveryOneSearch.handleBottom(
                nextPageHTMLNode.querySelectorAll("#page-relative")
              );
            }
          } else if (getResp.type === "onerror") {
            if (utils.isNull(nextPageUrl)) {
              log.error("未获取到下一页的url");
            } else {
              log.error("加载失败 👇");
              loadingView.setText("加载失败");
            }
            log.error(respData);
          } else if (getResp.type === "ontimeout") {
            log.error("请求超时 👇");
            loadingView.setText("请求超时");
            log.error(respData);
          } else {
            log.error("未知错误");
            loadingView.setText("未知错误");
            log.error(respData);
          }
        },
        /**
         * 初始化页码的CSS
         */
        initPageLineCSS() {
          GM_addStyle(`
          .whitesev-page-info{-webkit-tap-highlight-color:transparent}
          .whitesev-page-info .whitesev-new-pagenav{display:block;width:auto;color:#333;z-index:1;font-weight:700;text-decoration:none;position:relative;height:52px;line-height:52px}
          .whitesev-page-info .whitesev-new-pagenav{margin:.08rem;background:#fff;word-wrap:break-word;border:0;border-radius:.06rem;text-align:center;text-align:-webkit-center}
          .whitesev-page-info p::before{content:"第";margin-right:10px}
          .whitesev-page-info p::after{content:"页";margin-left:10px}
          `);
        },
        /**
         * 获取自定义页码元素
         * @param {string|number} _pageText_ 页码
         * @returns {HTMLElement}
         */
        getPageLineElement(_pageText_) {
          return DOMUtils.createElement("div", {
            class: "whitesev-page-info result-op",
            innerHTML: `
              <div class="whitesev-new-pagenav">
                <p>${_pageText_}</p>
              </div>
            `,
          });
        },
      };

      /**
       * 简单UA-自动点击下一页
       */
      const handleSearchCraftUserAgentPage = {
        /**
         * 滚动事件对象
         */
        scrollLockFunction: null,
        init() {
          let isSearchCraft = navigator?.userAgent?.includes("SearchCraft");
          log.success(
            `判断是否是SearchCraft：${
              isSearchCraft
                ? GM_Menu.getEnableTrueEmoji()
                : GM_Menu.getEnableFalseEmoji()
            }`
          );
          this.scrollLockFunction = new utils.LockFunction(
            this.scrollEvent,
            this
          );
          this.setNextPageScrollListener();
        },
        /**
         * 设置滚动事件
         */
        setNextPageScrollListener() {
          document.addEventListener("scroll", this.scrollLockFunction.run);
        },
        /**
         * 移除滚动事件
         */
        removeNextPageScrollListener() {
          document.removeEventListener("scroll", this.scrollLockFunction.run);
          log.info("取消绑定scroll", "#f400ff");
        },
        /**
         * 滚动事件
         * @async
         */
        async scrollEvent() {
          if (!utils.isNearBottom(window.innerHeight / 3)) {
            return;
          }
          let nextPageElement = document.querySelector(
            ".infinite-load-wrap .se-infiniteload-text"
          );
          if (!nextPageElement) {
            await utils.sleep(300);
            return;
          }
          if (nextPageElement.textContent.includes("更多结果")) {
            nextPageElement.click();
            await utils.sleep(500);
            return;
          } else if (
            nextPageElement.textContent.includes("到底了 没有更多内容了")
          ) {
            log.error("到底了 没有更多内容了，移除滚动监听");
            handleSearchCraftUserAgentPage.removeNextPageScrollListener();
          }
        },
      };
      /**
       * 处理劫持
       */
      const handleHijack = {
        run() {
          if (GM_Menu.get("baidu_search_hijack_openbox")) {
            log.success(
              GM_Menu.getShowTextValue("baidu_search_hijack_openbox")
            );
            baiduHijack.hijackOpenBox();
          }
          if (GM_Menu.get("baidu_search_hijack_scheme")) {
            log.success(GM_Menu.getShowTextValue("baidu_search_hijack_scheme"));
            baiduHijack.hijackFunctionApplyScheme();
          }
          if (GM_Menu.get("baidu_search_hijack_copy")) {
            log.success(GM_Menu.getShowTextValue("baidu_search_hijack_copy"));
            baiduHijack.hijackCopy();
          }
        },
      };

      if (window.location.pathname.startsWith("/bh")) {
        /* 百度健康 */
        log.info("插入CSS规则");
        GM_addStyle(this.css.searchBaiduHealth);

        GM_Menu.add([
          {
            key: "baidu_search_headlth_shield_other_info",
            text: "【屏蔽】底部其它信息",
            enable: true,
          },
          {
            key: "baidu_search_headlth_shield_bottom_toolbar",
            text: "【屏蔽】底部工具栏",
            enable: true,
          },
        ]);
        if (GM_Menu.get("baidu_search_headlth_shield_other_info")) {
          log.success(
            GM_Menu.getShowTextValue("baidu_search_headlth_shield_other_info")
          );
          GM_addStyle(`
          article[class] > div[class^="index_container"]{
            display: none !important;
          }
          `);
        }
        if (GM_Menu.get("baidu_search_headlth_shield_bottom_toolbar")) {
          log.success(
            GM_Menu.getShowTextValue(
              "baidu_search_headlth_shield_bottom_toolbar"
            )
          );
          GM_addStyle(`
          article[class] > div[class^="index_healthServiceButtonsRow"]{
            display: none !important;
          }
          `);
        }
      } else {
        /* 默认的百度搜索 */
        GM_Menu.add([
          {
            key: "baidu_search_automatically_expand_next_page",
            text: "自动展开下一页",
            enable: true,
            autoReload: false,
            callback(data) {
              if (
                data.enable &&
                GM_Menu.get(
                  "baidu_search_automatically_click_on_the_next_page_with_searchcraft_ua"
                )
              ) {
                GM_Menu.setEnable(data.key, false);
                GM_Menu.update();
                alert(
                  "与菜单功能 【简单UA-自动点击下一页】，请先关闭【简单UA-自动点击下一页】"
                );
              }
            },
          },
          {
            key: "baidu_search_automatically_click_on_the_next_page_with_searchcraft_ua",
            text: "简单UA-自动点击下一页",
            enable: false,
            autoReload: false,
            callback(data) {
              if (
                data.enable &&
                GM_Menu.get("baidu_search_automatically_expand_next_page")
              ) {
                GM_Menu.setEnable(data.key, false);
                GM_Menu.update();
                alert(
                  "与菜单功能 【自动展开下一页】，请先关闭【自动展开下一页】"
                );
              }
            },
          },
          {
            key: "baidu_search_show_redirected_icon",
            text: "显示已重定向图标",
          },
          {
            key: "baidu_search_show_log",
            text: "控制台输出日志",
          },
          {
            key: "baidu_search_sync_next_page_address",
            text: "同步下一页地址",
            callback(data) {
              if (data.enable) {
                alert(
                  "开启后，且开启【自动展开下一页】，当自动加载到第N页时，浏览器地址也会跟随改变，刷新网页就是当前加载的第N页"
                );
              }
            },
          },
          {
            key: "baidu_search_disable_autoplay_video",
            text: "【禁止】自动播放视频",
          },
          {
            key: "baidu_search_blocking_everyone_is_still_searching",
            text: "【屏蔽】大家还在搜",
            enable: true,
          },
          {
            key: "baidu_search_refactor_everyone_is_still_searching",
            text: "【重构】大家还在搜",
            enable: true,
          },
          {
            key: "baidu_search_shield_baidu_health",
            text: "【屏蔽】百度健康",
            enable: true,
          },
          {
            key: "baidu_search_hijack_openbox",
            text: "劫持OpenBox",
            enable: false,
          },
          {
            key: "baidu_search_hijack_scheme",
            text: "劫持Scheme",
            enable: false,
          },
          {
            key: "baidu_search_hijack_copy",
            text: "劫持Copy",
            enable: false,
          },
        ]);
        if (!GM_Menu.get("baidu_search_show_log")) {
          log.error("禁止控制台输出日志");
          log.disable();
        }
        if (GM_Menu.get("baidu_search_disable_autoplay_video")) {
          log.success(
            GM_Menu.getShowTextValue("baidu_search_disable_autoplay_video")
          );
          let funcLock = new utils.LockFunction(
            () => {
              let videoPlayerList = document.querySelectorAll(
                "[class*='-video-player']"
              );
              if (!utils.isNull(videoPlayerList)) {
                videoPlayerList.forEach((item) => {
                  item.remove();
                });
                log.success(["删除视频", videoPlayerList]);
              }
            },
            undefined,
            250
          );
          handleHijack.run();
          utils.mutationObserver(document.documentElement, {
            config: {
              subtree: true,
              childList: true,
            },
            callback: funcLock.run,
          });
        }

        handleItemURL.showIsDirectIcon = GM_Menu.get(
          "baidu_search_show_redirected_icon"
        );
        handleEveryOneSearch.refactorEveryoneIsStillSearching = GM_Menu.get(
          "baidu_search_refactor_everyone_is_still_searching"
        );
        log.info("插入CSS规则");
        GM_addStyle(this.css.search);
        DOMUtils.ready(function () {
          let searchUpdateRealLink = new utils.LockFunction(async () => {
            try {
              await handleItemURL.replaceLink();
            } catch (error) {
              log.error("替换为真实链接失败");
              log.error(error);
            }
          }, 600);
          let removeAdsLockFunction = new utils.LockFunction(
            handleItemURL.removeAds,
            600
          );
          utils.waitNode("div#page.search-page").then((element) => {
            utils.mutationObserver(element, {
              callback: async () => {
                await searchUpdateRealLink.run();
                removeAdsLockFunction.run();
              },
              config: {
                childList: true,
                subtree: true,
              },
            });
          });
          utils
            .waitNodeList("style[class^='vsearch-sigma-style']")
            .then((nodeList) => {
              /* 这个style标签就是某些搜索置顶的卡片 */
              log.success(["删除sigma的CSS", nodeList]);
              nodeList.forEach((item) => item.remove());
            });
          handleItemURL.originURLMap =
            handleItemURL.parseScriptDOMOriginUrlMap(document);
          handleItemURL.removeAds();
          handleItemURL.replaceScriptBaiDuTip();
          handleItemURL.redirectTopLink();
          handleInputEvent.run();
          searchUpdateRealLink.run();
          if (GM_Menu.get("baidu_search_automatically_expand_next_page")) {
            log.success(
              GM_Menu.getShowTextValue(
                "baidu_search_automatically_expand_next_page"
              )
            );
            handleNextPage.init();
          } else if (
            GM_Menu.get(
              "baidu_search_automatically_click_on_the_next_page_with_searchcraft_ua"
            )
          ) {
            log.success(
              GM_Menu.getShowTextValue(
                "baidu_search_automatically_click_on_the_next_page_with_searchcraft_ua"
              )
            );
            handleSearchCraftUserAgentPage.init();
          }
          if (
            window.location.href.startsWith("https://m.baidu.com/sf/vsearch")
          ) {
            utils
              .waitNode("#realtime-container .c-infinite-scroll")
              .then((element) => {
                let replaceVSearchLinkLonkFunction = new utils.LockFunction(
                  handleItemURL.replaceVSearchLink,
                  600
                );
                utils.mutationObserver(element, {
                  config: {
                    subtree: true,
                    childList: true,
                  },
                  callback: replaceVSearchLinkLonkFunction.run,
                });
              });
          }
        });
      }
    },
    /**
     * 百家号
     */
    baijiahao() {
      if (!this.url.match(/^http(s|):\/\/baijiahao.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.baijiahao);
      log.info("插入CSS规则");
      GM_Menu.add([
        {
          key: "baijiahao_shield_recommended_article",
          text: "【屏蔽】推荐文章",
          enable: true,
        },
        {
          key: "baijiahao_shield_user_comment",
          text: "【屏蔽】用户评论",
        },
        {
          key: "baijiahao_shield_user_comment_input_box",
          text: "【屏蔽】底部悬浮工具栏",
        },
        {
          key: "baijiahao_hijack_wakeup",
          text: "劫持唤醒",
          enable: false,
        },
        {
          key: "baidu_baijiahao_hijack_iframe",
          text: "劫持iframe",
          enable: true,
        },
        {
          key: "baidu_baijiahao_hijack_openbox",
          text: "劫持OpenBox",
          enable: false,
        },
      ]);
      if (GM_Menu.get("baijiahao_shield_recommended_article")) {
        log.success(
          GM_Menu.getShowTextValue("baijiahao_shield_recommended_article")
        );
        GM_addStyle(`
			  .infinite-scroll-component__outerdiv, 
        div#page_wrapper > div > div:nth-child(5), 
        div:has(+ .infinite-scroll-component__outerdiv), 
        /* 电脑端的左边的按钮-屏蔽 */
        #ssr-content > :last-child , 
        /* 电脑端的右边的推荐-屏蔽 */
        #ssr-content > div:nth-child(2) > div:nth-child(1) > div:nth-child(2){
          display: none !important;
        }

        /* 电脑端的文章居中 */
        #ssr-content > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) {
          width: 55% !important;
        }`);
        /* 某些情况下的CSS */
        GM_addStyle(`
        #page_wrapper > div.other > div[class=""]:nth-child(4){
          display: none !important;
        }
        `);
        /* 简单UA&链接参数wfr=spide下的精彩推荐 */
        GM_addStyle(`
        #page_wrapper div.spider > div[class=""]:nth-child(4),
        #page_wrapper div.spider > div[class=""]:nth-child(5){
          display: none !important;
        }`);
        /* Gecko的简单UA下的精彩推荐 */
        GM_addStyle(`
        #page_wrapper .searchCraft > div[class=""]{
          display: none !important;
        }`);
      }
      if (GM_Menu.get("baijiahao_shield_user_comment")) {
        log.success(GM_Menu.getShowTextValue("baijiahao_shield_user_comment"));
        GM_addStyle(`
        #commentModule{
          display: none !important;
        }`);
      }
      if (GM_Menu.get("baijiahao_shield_user_comment_input_box")) {
        log.success(
          GM_Menu.getShowTextValue("baijiahao_shield_user_comment_input_box")
        );
        GM_addStyle(`
        div#wise-invoke-interact-bar{
          display: none !important;
        }`);
      }
      if (GM_Menu.get("baijiahao_hijack_wakeup")) {
        log.success(GM_Menu.getShowTextValue("baijiahao_hijack_wakeup"));
        baiduHijack.hijackFunctionCall_BaiJiaHao_Map();
      }
      if (GM_Menu.get("baidu_baijiahao_hijack_iframe")) {
        log.success(GM_Menu.getShowTextValue("baidu_baijiahao_hijack_iframe"));
        baiduHijack.hijackElementAppendChild(function (element) {
          if (
            element.localName === "script" &&
            element?.src?.includes("landing-share")
          ) {
            log.success("阻止加载：" + element.src);
            return true;
          }
        });
      }
      if (GM_Menu.get("baidu_baijiahao_hijack_openbox")) {
        log.success(GM_Menu.getShowTextValue("baidu_baijiahao_hijack_openbox"));
        baiduHijack.hijackOpenBox();
      }
    },
    /**
     * 百度贴吧
     */
    tieba() {
      if (!this.url.match(/^http(s|):\/\/(tieba.baidu|www.tieba).com/g)) {
        return;
      }

      /**
       * 贴吧数据信息
       */
      const tiebaInfo = {
        /**
         * 当前吧名
         */
        forumName: undefined,
      };
      /**
       * 贴吧加载评论
       */
      const tiebaCommentConfig = {
        /**
         * 当前页
         */
        page: 1,
        /**
         * 当前最大页
         */
        maxPage: 1,
        /**
         * 楼层数量
         */
        floor_num: 1,
        /**
         * 滚动监听锁
         */
        funcLock: null,
        /**
         * tid
         */
        param_tid: null,
        /**
         * 帖子id
         */
        param_forum_id: null,
        /**
         * 帖子回复的数量
         */
        reply_num: 0,
        /**
         * 进过百度验证的额外安全参数
         */
        extraSearchSignParams: "",
        /**
         * vue根元素
         * @type {HTMLElement}
         */
        vueRootView: null,
        /**
         * 判断是否在底部附近的误差值
         * @type
         */
        isNearBottomValue: 250,
        /**
         * scroll事件触发 自动加载下一页的评论
         */
        nextPageScrollEvent: async (event) => {
          if (event.jsTrigger) {
            /* js主动触发 */
          } else if (
            !utils.isNearBottom(tiebaCommentConfig.isNearBottomValue)
          ) {
            return;
          }
          loadingView.setText("Loading...", true);
          loadingView.show();
          let timeStamp = Date.now();
          let nextPageUrl = `https://tieba.baidu.com/p/${tiebaCommentConfig.param_tid}?pn=${tiebaCommentConfig.page}${tiebaCommentConfig.extraSearchSignParams}`;
          let nextPageAllCommentUrl = `https://tieba.baidu.com/p/totalComment?t=${timeStamp}&tid=${tiebaCommentConfig.param_tid}&fid=${tiebaCommentConfig.param_forum_id}&pn=${tiebaCommentConfig.page}&see_lz=0${tiebaCommentConfig.extraSearchSignParams}`;
          log.info("请求下一页评论的url: " + nextPageUrl);
          log.info("贴子所有评论的url: " + nextPageAllCommentUrl);
          let pageDOM = await tiebaCommentConfig.getPageComment(nextPageUrl);
          let pageCommentList = await tiebaCommentConfig.getPageCommentList(
            nextPageAllCommentUrl
          );
          if (
            !pageDOM ||
            typeof pageDOM === "string" ||
            !pageCommentList.commentList
          ) {
            loadingView.setText(
              loadingView.setText(
                typeof pageDOM === "string" ? pageDOM : "获取评论失败"
              )
            );
            log.error(pageDOM);
            log.error(pageCommentList);
            tiebaCommentConfig.removeScrollListener();
            return;
          }
          log.info("成功获取下一页评论和楼中楼评论");
          let comments = pageDOM.querySelectorAll(".l_post.l_post_bright");
          comments = Array.from(comments);
          if (tiebaCommentConfig.page == 1) {
            /* 为第一页时，去除第一个，也就是主评论 */
            comments.splice(0, 1);
          }
          comments.forEach((ele) => {
            tiebaCommentConfig.insertNewCommentInnerElement(
              tiebaCommentConfig.getNewCommentInnerElement(ele, pageCommentList)
            );
            tiebaCommentConfig.floor_num += 1;
          });
          if (
            document
              .querySelector(".white-only-lz")
              .classList.contains("white-only-lz-qx")
          ) {
            document.querySelectorAll(".post-item").forEach((ele) => {
              let landlord = ele.getAttribute("landlord");
              if (landlord == "0") {
                ele.classList.add("white-only-lz-none");
              }
            });
          }
          loadingView.hide();
          if (tiebaCommentConfig.page >= tiebaCommentConfig.maxPage) {
            log.info("已加载所有的评论");
            loadingView.setText("已加载所有的评论");
            loadingView.hide();
            tiebaCommentConfig.removeScrollListener();
          }
          tiebaCommentConfig.page++;
        },
        /**
         * scroll事件触发 自动加载上一页的评论
         */
        prevPageScrollEvent: async (event) => {
          if (event.jsTrigger) {
            /* js主动触发 */
          } else if (
            !utils.isNearBottom(tiebaCommentConfig.isNearBottomValue)
          ) {
            return;
          }
          loadingView.setText("Loading...", true);
          loadingView.show();
          let timeStamp = Date.now();
          let pageUrl = `https://tieba.baidu.com/p/${tiebaCommentConfig.param_tid}?pn=${tiebaCommentConfig.page}${tiebaCommentConfig.extraSearchSignParams}`;
          let pageAllCommentUrl = `https://tieba.baidu.com/p/totalComment?t=${timeStamp}&tid=${tiebaCommentConfig.param_tid}&fid=${tiebaCommentConfig.param_forum_id}&pn=${tiebaCommentConfig.page}&see_lz=0${tiebaCommentConfig.extraSearchSignParams}`;
          log.info("请求上一页评论的url: " + pageUrl);
          log.info("贴子所有评论的url: " + pageAllCommentUrl);
          let pageDOM = await tiebaCommentConfig.getPageComment(pageUrl);
          let pageCommentList = await tiebaCommentConfig.getPageCommentList(
            pageAllCommentUrl
          );
          if (
            !pageDOM ||
            typeof pageDOM === "string" ||
            !pageCommentList.commentList
          ) {
            loadingView.setText(
              loadingView.setText(
                typeof pageDOM === "string" ? pageDOM : "获取评论失败"
              )
            );
            log.error(pageDOM);
            log.error(pageCommentList);
            tiebaCommentConfig.removeScrollListener();
            return;
          }
          log.info("成功获取上一页评论和楼中楼评论");
          let comments = pageDOM.querySelectorAll(".l_post.l_post_bright");
          comments = Array.from(comments);
          if (tiebaCommentConfig.page == 1) {
            /* 为第一页时，去除第一个，也就是主评论 */
            comments.splice(0, 1);
          }
          comments.reverse();
          comments.forEach((element) => {
            tiebaCommentConfig.insertNewCommentInnerElement(
              tiebaCommentConfig.getNewCommentInnerElement(
                element,
                pageCommentList
              )
            );
            tiebaCommentConfig.floor_num++;
          });
          if (
            document
              .querySelector(".white-only-lz")
              .classList.contains("white-only-lz-qx")
          ) {
            document.querySelectorAll(".post-item").forEach((ele) => {
              let landlord = ele.getAttribute("landlord");
              if (landlord == "0") {
                ele.classList.add("white-only-lz-none");
              }
            });
          }
          loadingView.hide();
          if (tiebaCommentConfig.page <= 1) {
            log.info("已加载所有的评论");
            loadingView.setText("已加载所有的评论");
            loadingView.hide();
            tiebaCommentConfig.removeScrollListener();
          }
          tiebaCommentConfig.page--;
        },
        /**
         * 设置自动加载下一页的scrol事件
         */
        setNextPageScrollListener() {
          tiebaCommentConfig.funcLock = new utils.LockFunction(
            tiebaCommentConfig.nextPageScrollEvent,
            this
          );
          document.addEventListener("scroll", tiebaCommentConfig.funcLock.run);
          utils.dispatchEvent(document, "scroll", { jsTrigger: true });
          log.success("scroll监听事件【下一页】");
        },
        /**
         * 设置自动加载上一页的scrol事件
         */
        setPrevPageScrollListener() {
          tiebaCommentConfig.funcLock = new utils.LockFunction(
            tiebaCommentConfig.prevPageScrollEvent,
            this
          );
          document.addEventListener("scroll", tiebaCommentConfig.funcLock.run);
          utils.dispatchEvent(document, "scroll", { jsTrigger: true });
          log.success("scroll监听事件【上一页】");
        },
        /**
         * 移除scoll事件
         */
        removeScrollListener() {
          if (tiebaCommentConfig.funcLock) {
            document.removeEventListener(
              "scroll",
              tiebaCommentConfig.funcLock.run
            );
            log.success("取消绑定scroll", "#f400ff");
          }
        },
        /**
         * 根据dom获取需要插入的评论的html
         * @param {HTMLElement} element
         * @param { {commentList: any[], userList: any[]}[] } pageCommentList
         * @returns {?HTMLElement}
         */
        getNewCommentInnerElement: (element, pageCommentList) => {
          let data_field = utils.toJSON(element.getAttribute("data-field"));
          if (Object.keys(data_field).length == 0) {
            return;
          }
          let user_id = data_field["author"]["user_id"];
          let builderId = data_field["content"]["builderId"];

          let userComment = data_field["content"]["content"];
          let userHomeUrl = element
            .querySelector(".p_author_face")
            .getAttribute("href");
          let user_landlord_name = data_field["author"]["user_name"];
          let userName = element.querySelector(".p_author_name");
          if (userName) {
            userName = userName.textContent;
          } else {
            userName = element
              .querySelector(".p_author_face > img")
              .getAttribute("username");
          }

          let userAvatar =
            element
              .querySelector(".p_author_face > img")
              .getAttribute("data-tb-lazyload") ||
            element.querySelector(".p_author_face > img").src;

          let is_landlord = 0;
          if (user_id == builderId) {
            userName =
              userName +
              '<svg data-v-188c0e84="" class="landlord"><use xlink:href="#icon_landlord"></use></svg>';
            is_landlord = 1;
          }
          let ele_tail_wrap = element.querySelector(".post-tail-wrap");
          let user_ip_position = "";
          let user_floor = "";
          let user_comment_time = "1970-1-1 00:00:00";
          if (ele_tail_wrap) {
            let childrenElement =
              ele_tail_wrap.querySelectorAll("span.tail-info");
            let childSpanElementList = Array.from(
              ele_tail_wrap.querySelectorAll("span")
            );
            for (let index = 0; index < childSpanElementList.length; index++) {
              let childSpanElement = childSpanElementList[index];
              if (childSpanElement.hasAttribute("class")) {
                continue;
              }
              if (!childSpanElement.textContent.match("来自|禁言")) {
                user_ip_position = childSpanElement.textContent;
                break;
              }
            }
            if (childrenElement.length == 3 || childrenElement.length == 2) {
              user_floor =
                childrenElement[childrenElement.length - 2].textContent;
              user_comment_time =
                childrenElement[childrenElement.length - 1].textContent;
            } else {
              log.error("获取PC端的数据楼层和时间信息失败👇");
              log.error(childrenElement);
              user_floor = "";
              user_comment_time = "";
            }
          } else {
            ele_tail_wrap = element.querySelector(".acore_reply_tail");
            user_ip_position = data_field["content"]["ip_address"];
            /* 评论楼层 */
            user_floor = data_field["content"]["post_no"] + "楼";
            user_comment_time = data_field["content"]["date"];
            if (!userComment) {
              userComment = element.querySelector(".d_post_content").innerHTML;
            }
          }
          /* 结束时间 */
          let currentTime = new Date();
          /* 时间差的毫秒数 */
          let timeDifference =
            currentTime.getTime() -
            new Date(user_comment_time.replace(/-/g, "/")).getTime();

          /* ------------------------------ */

          /* 计算出相差天数 */
          let days = Math.floor(timeDifference / (24 * 3600 * 1000));
          if (days > 0) {
            user_comment_time = days + "天前";
          } else {
            /* 计算天数后剩余的毫秒数 */
            let leave1 = timeDifference % (24 * 3600 * 1000);
            /* 计算出小时数 */
            let hours = Math.floor(leave1 / (3600 * 1000));
            if (hours > 0) {
              user_comment_time = hours + "小时前";
            } else {
              /* 计算相差分钟数 */
              let leave2 = leave1 % (3600 * 1000);
              /* 计算小时数后剩余的毫秒数 */
              let minutes = Math.floor(leave2 / (60 * 1000));
              if (minutes > 0) {
                user_comment_time = minutes + "分钟前";
              } else {
                /* 计算相差秒数 */
                let leave3 = leave2 % (60 * 1000);
                /* 计算分钟数后剩余的毫秒数 */
                let seconds = Math.round(leave3 / 1000);
                user_comment_time = seconds + "秒前";
              }
            }
          }
          if (userAvatar.startsWith("//")) {
            userAvatar = "https:" + userAvatar;
          }
          let userAvatarObj = new URL(userAvatar);
          let userPortrait = data_field["author"]["portrait"];
          if (!userPortrait) {
            let userAvatarObjMatch =
              userAvatarObj.pathname.match(/\/item\/(.+)/i);
            if (userAvatarObjMatch) {
              userPortrait = userAvatarObjMatch[1];
            }
          }
          let post_id = data_field["content"]["post_id"];
          let newUserCommentHTML = "";
          if (pageCommentList.commentList[post_id]) {
            Array.from(
              pageCommentList.commentList[post_id].comment_info
            ).forEach((result) => {
              let u_user_name = result["show_nickname"];
              let u_content = result["content"];
              let u_user_id = result["user_id"];
              let u_user_portrait =
                pageCommentList.userList[u_user_id]["portrait"];
              let u_user_home_url = "/home/main?id=" + u_user_portrait;
              if (builderId == u_user_id) {
                u_user_name +=
                  '<svg data-v-5b60f30b="" class="landlord"><use xlink:href="#icon_landlord"></use></svg>';
              }
              let newInnerHTML = `<div data-v-5b60f30b="" class="lzl-post-item" style="">
                  <div data-v-5b60f30b="" class="text-box">
                    <span data-v-5b60f30b="" class="link username" data-home-url="${u_user_home_url}">${u_user_name}</span>
                    <div data-v-ab14b3fe="" data-v-5b60f30b="" class="thread-text lzl-post-text">
                      <span data-v-ab14b3fe="" class="text-content">${u_content}</span>
                    </div>
                  </div>
                </div>
                `;
              newUserCommentHTML += newInnerHTML;
            });
          }

          if (newUserCommentHTML) {
            newUserCommentHTML = `
            <div data-v-5b60f30b="" data-v-74eb13e2="" class="lzl-post lzl-post" style="max-height: 2.35rem;overflow-y: hidden;">
              ${newUserCommentHTML}
            </div>
            `;
          }
          let newCommentElement = DOMUtils.createElement("div", {
            "data-v-74eb13e2": "",
            "data-v-602e287c": "",
            class: "post-item",
            "data-whitesev": {
              userId: user_id,
              userPostId: post_id,
              userPortrait: userPortrait,
              userFloor: parseInt(user_floor),
              userComment: userComment,
              userHomeUrl: userHomeUrl,
              userAvatar: userAvatar,
              userName: userName,
              userCommentTime: user_comment_time,
              userIpPosition: user_ip_position,
              pageCommentList: pageCommentList,
            },
            "data-floor": tiebaCommentConfig.floor_num,
            landlord: is_landlord,
            innerHTML: `
              <div
                data-v-188c0e84=""
                data-v-74eb13e2=""
                class="user-line-wrapper user-line-post">
                <div data-v-188c0e84="" class="user-line">
                  <div
                    data-v-188c0e84=""
                    class="tbfe-1px-border avatar"
                    data-home-url="${userHomeUrl}"
                    data-src="${userAvatar}"
                    lazy="loaded"
                    style="background-image: url(${userAvatar});"></div>
                  <div data-v-188c0e84="" class="user-info">
                    <div data-v-188c0e84="" class="username" data-home-url="${userHomeUrl}">
                      ${userName}
                    </div>
                    <p data-v-188c0e84="" class="desc-info">
                      <span data-v-188c0e84="" class="floor-info">
                        ${user_floor}
                      </span>
                      <span data-v-188c0e84="" class="time" style="margin-right: .08rem;">
                        ${user_comment_time}
                      </span>
                      <span data-v-188c0e84="" class="ip">
                        ${user_ip_position}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div data-v-74eb13e2="" class="content">
                <p data-v-ab14b3fe="" data-v-74eb13e2="" class="thread-text post-text">
                  <span data-v-ab14b3fe="" class="text-content">
                    ${userComment}
                  </span>
                </p>
                ${newUserCommentHTML}
                <div data-v-74eb13e2="" class="post-split-line"></div>
              </div>
              `,
          });
          return newCommentElement;
        },
        /**
         * 根据评论的html插入页面中
         * @param {?Element} newCommentDOM
         */
        insertNewCommentInnerElement: (newCommentDOM) => {
          if (newCommentDOM == null) {
            return;
          }
          newCommentDOM.querySelectorAll("a").forEach((item) => {
            item.setAttribute("data-href", item.href);
            item.removeAttribute("href");
            item.removeAttribute("target");
          });

          /* 评论，点击头像跳转到这个人的空间 */
          newCommentDOM
            .querySelectorAll(".tbfe-1px-border.avatar")
            .forEach((item) => {
              if (item.hasAttribute("data-home-url")) {
                item.onclick = function () {
                  window.open(item.getAttribute("data-home-url"), "_blank");
                };
              }
            });
          /* 评论，点击名字跳转到这个人的空间 */
          newCommentDOM
            .querySelectorAll(".user-info .username")
            .forEach((item) => {
              if (item.hasAttribute("data-home-url")) {
                item.onclick = function () {
                  window.open(item.getAttribute("data-home-url"), "_blank");
                };
              }
            });
          /* 评论的回复，点击头像跳转到这个人的空间 */
          /* newCommentDOM.querySelectorAll(".link.username").forEach((item) => {
            if (item.hasAttribute("data-home-url")) {
              item.onclick = function () {
                window.open(item.getAttribute("data-home-url"), "_blank");
              };
            }
          }); */
          /* 评论的回复的回复，点击头像跳转到这个人的空间 */
          /* newCommentDOM.querySelectorAll("a.at").forEach((item) => {
            item.removeAttribute("onclick");
            item.removeAttribute("onmouseover");
            item.removeAttribute("onmouseout");
            if (item.hasAttribute("portrait")) {
              item.setAttribute(
                "href",
                "/home/main?id=" + item.getAttribute("portrait")
              );
            }
          }); */

          if (document.querySelector(".post-cut-guide")) {
            DOMUtils.before(
              document.querySelector(".post-cut-guide"),
              newCommentDOM
            );
          } else {
            /* 老版帖子 */
            DOMUtils.append(
              document.querySelector(".pb-page-wrapper"),
              newCommentDOM
            );
          }
          /* 如果评论存在不可见的，添加一个 查看全部xx条回复 */
          let lzlPostElement =
            newCommentDOM.querySelector(".lzl-post.lzl-post");
          if (lzlPostElement) {
            let lzlPostElementHeight = DOMUtils.height(lzlPostElement);
            let lzlPostItemList =
              lzlPostElement.querySelectorAll(".lzl-post-item");
            let currentLzlPostElementHeight = 0;
            let addSeeAllReply = false;
            for (const lzlPostItem of lzlPostItemList) {
              currentLzlPostElementHeight += DOMUtils.outerHeight(lzlPostItem);
              if (currentLzlPostElementHeight > lzlPostElementHeight) {
                addSeeAllReply = true;
                break;
              }
            }
            if (addSeeAllReply) {
              let lzlCommentNums =
                newCommentDOM["data-whitesev"]["pageCommentList"][
                  "commentList"
                ][newCommentDOM["data-whitesev"]["userPostId"]]["comment_num"];
              let seeAllReplyElement = DOMUtils.createElement("div", {
                class: "whitesev-see-all-reply",
                style: "color: #6251B3;margin-top: 5px 0 0 10px;",
                innerHTML: `
                查看全部${lzlCommentNums}条回复
                `,
              });
              DOMUtils.on(seeAllReplyElement, "click", function () {
                lzlPostElement.click();
              });
              DOMUtils.after(lzlPostElement, seeAllReplyElement);
            }
            DOMUtils.on(lzlPostElement, "click", function () {
              log.success(`点击查看全部回复`);
              tiebaCommentConfig.showReplyDialog(lzlPostElement);
            });
          }
        },
        /**
         * 初始化评论的弹窗的所有设置包括CSS
         */
        initReplyDialogCSS() {
          log.success("初始化回复的弹窗");
          GM_addStyle(`
          /* 主 */
          #whitesev-reply-dialog{
            z-index: 99999;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          /* 背景 */
          .whitesev-reply-dialog-bg{
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,.5);
            transition-timing-function: ease-in;
            transition-duration: .1s;
            transition-property: background-color,opacity;
          }
          /* 内容容器 */
          .whitesev-reply-dialog-sheet{
            position: absolute;
            bottom: 0;
            left: 0;
            z-index: 2;
            width: 100%;
            background-color: #fff;
            transition: .1s ease-in;
            transition-property: transform;
            transform: translate(0,100%);
            border-radius: 10px 10px 0px 0px;
          }
          /* 关闭 */
          .whitesev-reply-dialog-close{
            position: absolute;
          }
          /* 标题 */
          .whitesev-reply-dialog-sheet-title{
            display: block;
            width: 100%;
            box-sizing: border-box;
            padding: 15px;
            color: #222;
            line-height: 20px;
            text-align: center;
            border-bottom: 1px solid #dbdbdb;
          }
          /* 内容 */
          .whitesev-reply-dialog-sheet-content{
            height: 100%;
            overflow-y: auto;
          }
          /* 内容中主内容和其它内容 */
          .whitesev-reply-dialog-sheet-main-content,
          .whitesev-reply-dialog-sheet-other-content{
            margin: 20px 10px 10px 10px;
          }
          /* 内容中其它内容 */
          .whitesev-reply-dialog-sheet-ohter-content{

          }
          /* 弹出 */
          #whitesev-reply-dialog[data-on] .whitesev-reply-dialog-bg{
            transition-timing-function: ease-in;
            transition-duration: .2s;
          }
          #whitesev-reply-dialog[data-on] .whitesev-reply-dialog-bg{
            background-color: rgba(0,0,0,.5);
          }
          #whitesev-reply-dialog[data-on] .whitesev-reply-dialog-sheet{
            transition: .2s ease-in;
            transform: translate(0,0);
          }

          /* 头像 */
          .whitesev-reply-dialog-avatar {
            position: relative;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            width: .36rem;
            height: .36rem;
            margin-right: .08rem;
            border-radius: 50%;
            background-repeat: no-repeat;
            background-position: 50%;
            background-size: cover;
            -webkit-box-flex: 0;
            -moz-box-flex: 0;
            -webkit-flex: none;
            -ms-flex: none;
            flex: none;
          }
          
          /* 用户行 */
          .whitesev-reply-dialog-user-line {
              display: flex;
              align-items: center;
          }
          .whitesev-reply-dialog-user-line,
          .whitesev-reply-dialog-user-comment,
          .whitesev-reply-dialog-user-desc-info {
              margin-bottom: 8px;
          }
          /* 评论 */
          .whitesev-reply-dialog-user-comment {
              margin-left: .44rem;
          }
          /* 评论的贴吧自带表情 */
          .whitesev-reply-dialog-user-comment img.BDE_Smiley{
            width: .2rem;
            height: .2rem;
            vertical-align: middle;
          }
          /* 评论的贴吧自己上传的图片 */
          .whitesev-reply-dialog-user-comment img:not(.BDE_Smiley){
            margin-top: 8px;
            max-width: 350px;
            cursor: url(//tb2.bdstatic.com/tb/static-pb/img/cur_zin.cur),pointer;
            height: auto;
            width: auto;
            width: 100%;
          }
          /* 底部信息 */
          .whitesev-reply-dialog-user-desc-info{
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
              margin-left: .44rem;
              border-bottom: 1px solid #dfdfdf;
          }
          .whitesev-reply-dialog-user-desc-info span{
              margin-right: .08rem;
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: center;
              -moz-box-align: center;
              -webkit-align-items: center;
              -moz-align-items: center;
              -ms-flex-align: center;
              align-items: center;
              font-size: .12rem;
              line-height: .18rem;
              overflow: hidden;
              white-space: nowrap;
              -o-text-overflow: ellipsis;
              text-overflow: ellipsis;
              color: #a3a2a8;
          }
          /* 第xx楼 */
          .whitesev-reply-dialog-user-desc-info span[data-floor-info]::before {
              content:"第"
          }
          .whitesev-reply-dialog-user-desc-info span[data-floor-info]::after {
              content:"楼"
          }
          /* 中间行 */
          .whitesev-reply-dialog-sheet-main-content-bottom-line {
            background: #ebebeb;
            height: 6px;
          }
          /* 隐藏顶部主回复的底部边框 */
          .whitesev-reply-dialog-sheet-main-content .whitesev-reply-dialog-user-desc-info{
              border-bottom: none;
          }
          /* 其它回复中的最后一个 */
          .whitesev-reply-dialog-sheet-other-content > div:last-child{
            padding-bottom: 40px;
          }
          /* 其它回复的每一项 */
          .whitesev-reply-dialog-sheet-other-content-item{
            margin-top: 12px;
          }
          /* 其它回复的底部边框 */
          .whitesev-reply-dialog-sheet-other-content-item .whitesev-reply-dialog-user-desc-info{
            padding-bottom: 12px;
          }
          /* xx条回复 */
          .whitesev-reply-dialog-sheet-comment-num {
            margin-top: -10px;
            margin-bottom: 20px;
          }
          /* 查看全部xx条回复 */
          .whitesev-see-all-reply{
            padding-top: 10px;
            padding-left: 10px;
          }
          `);
        },
        /**
         * 显示评论的弹窗
         * @param {HTMLElement} element
         */
        showReplyDialog(element) {
          let contentElement = element.closest(
            "div.post-item[data-v-74eb13e2]"
          );
          let data = {};
          if (contentElement && contentElement["data-whitesev"]) {
            data = contentElement["data-whitesev"];
          }
          log.success(["data-whitesev数据", data]);
          /* 当前评论数据信息JSON */
          let currentCommentData =
            data["pageCommentList"]["commentList"][data["userPostId"]][
              "comment_info"
            ];
          log.success(["当前评论数据信息JSON", currentCommentData]);
          /* 楼中楼评论的总共数量 */
          let currentCommentListNum =
            data["pageCommentList"]["commentList"][data["userPostId"]][
              "comment_num"
            ];
          /* 用户信息JSON */
          let userList = data["pageCommentList"]["userList"];
          let mainUserAvatar = data["userAvatar"];
          let otherCommentsHTML = "";
          let userAvatarHostName = new URL(mainUserAvatar).hostname;
          let userAvatarPath = new URL(mainUserAvatar).pathname.split("/")[1];
          let landlordInfo = tiebaBusiness.getLandlordInfo();
          log.success(["头像加密值路径是", userAvatarPath]);
          log.success(["本帖楼主的信息", landlordInfo]);
          currentCommentData.forEach((item) => {
            /* 用户信息 */
            let itemUserInfo = userList[item["user_id"]];
            /* 用户id值 */
            let userPortrait = itemUserInfo["portrait"];
            /* 判断是否是楼主 */
            let isLandlord = Boolean(
              landlordInfo && landlordInfo.id === item["user_id"]
            );
            /* 获取时间差 */
            let itemUserCommentTime =
              utils.getDaysDifference(
                item["now_time"] * 1000,
                undefined,
                "auto"
              ) + "前";
            /* 用户ip？好像没有 */
            let itemUserCommentIp = "";
            if (item["location"] && item["location"]["name"]) {
              itemUserCommentIp = item["location"]["name"];
            }
            if (userAvatarHostName === "imgsa.baidu.com") {
              userAvatarHostName = "gss0.bdstatic.com";
              userAvatarPath = "6LZ1dD3d1sgCo2Kml5_Y_D3";
            }
            let itemUserAvatar = `https://${userAvatarHostName}/${userAvatarPath}/sys/portrait/item/${userPortrait}`;
            if (userAvatarPath === "sys") {
              itemUserAvatar = itemUserAvatar.replace(
                "/sys/sys/portrait/item/",
                "/sys/portrait/item/"
              );
            }
            otherCommentsHTML += `
            <div class="whitesev-reply-dialog-sheet-other-content-item">
              <div class="whitesev-reply-dialog-user-line" data-portrait="${userPortrait}">
                <div class="whitesev-reply-dialog-avatar" style="background-image: url(${itemUserAvatar});"></div>
                <div class="whitesev-reply-dialog-user-info">
                  <div class="whitesev-reply-dialog-user-username">${
                    item["show_nickname"]
                  }${
              isLandlord
                ? `<svg data-v-188c0e84="" class="landlord"><use xlink:href="#icon_landlord"></use></svg>`
                : ""
            }</div>
                </div>
              </div>
              <div class="whitesev-reply-dialog-user-comment">${
                item["content"]
              }</div>
              <div class="whitesev-reply-dialog-user-desc-info">
                  <span data-time="">${itemUserCommentTime}</span>
                  <span data-ip="">${itemUserCommentIp}</span>
              </div>
            </div>
            `;
          });
          log.success(["显示评论的弹窗", data]);
          let dialog = DOMUtils.createElement("div", {
            id: "whitesev-reply-dialog",
            innerHTML: `
            <div class="whitesev-reply-dialog-bg"></div>
            <div class="whitesev-reply-dialog-sheet" style="height: ${
              DOMUtils.height(document.documentElement) * 0.92
            }px;">
              <div class="whitesev-reply-dialog-sheet-title">
                <div class="whitesev-reply-dialog-close">
                  <svg t="1694574625629" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2306" width="20" height="20"><path d="M576 512l277.333333 277.333333-64 64-277.333333-277.333333L234.666667 853.333333 170.666667 789.333333l277.333333-277.333333L170.666667 234.666667 234.666667 170.666667l277.333333 277.333333L789.333333 170.666667 853.333333 234.666667 576 512z" fill="#444444" p-id="2307"></path></svg>
                </div>
                ${data.userFloor}楼的回复
              </div>
              <div class="whitesev-reply-dialog-sheet-content">
              <div class="whitesev-reply-dialog-sheet-main-content">
                  <div class="whitesev-reply-dialog-user-line" data-portrait="${
                    data["userPortrait"]
                  }">
                    <div class="whitesev-reply-dialog-avatar" style="background-image: url(${
                      data["userAvatar"]
                    });"></div>
                    <div class="whitesev-reply-dialog-user-info">
                      <div class="whitesev-reply-dialog-user-username">${
                        data["userName"]
                      }</div>
                    </div>
                  </div>
                  <div class="whitesev-reply-dialog-user-comment">${
                    data["userComment"]
                  }</div>
                  <div class="whitesev-reply-dialog-user-desc-info" style="border-bottom: none;">
                      <span data-floor-info="">${data["userFloor"]}</span>
                      <span data-time="">${data["userCommentTime"]}</span>
                      <span data-ip="">${data["userIpPosition"]}</span>
                  </div>
              </div>
              <div class="whitesev-reply-dialog-sheet-main-content-bottom-line"></div>
              <div class="whitesev-reply-dialog-sheet-other-content">
                <div class="whitesev-reply-dialog-sheet-comment-num">${currentCommentListNum}条回复</div>
                ${otherCommentsHTML}
              </div>
              </div>
            </div>
            `,
          });

          /**
           * 设置浏览器历史地址
           */
          function popstateEvent() {
            log.success("触发popstate事件");
            resumeBack();
          }

          /**
           * 禁止浏览器后退按钮
           */
          function banBack() {
            /* 监听地址改变 */
            log.success("监听地址改变");
            tiebaCommentConfig.vueRootView.__vue__.$router.push("/seeLzlReply");
            DOMUtils.on(window, "popstate", popstateEvent);
          }

          /**
           * 允许浏览器后退并关闭小窗
           */
          async function resumeBack() {
            DOMUtils.off(window, "popstate", popstateEvent);
            log.success("浏览器地址后退，并关闭小窗");
            closeDialogByUrlChange();
            while (1) {
              if (
                tiebaCommentConfig.vueRootView.__vue__.$router.history.current
                  .fullPath === "/seeLzlReply"
              ) {
                log.info("后退！");
                tiebaCommentConfig.vueRootView.__vue__.$router.back();
                await utils.sleep(250);
              } else {
                return;
              }
            }
          }

          /**
           * 关闭楼中楼弹窗
           * @param {Event|undefined} event 事件
           */
          function closeDialog() {
            dialog.removeAttribute("data-on");
            DOMUtils.on(
              dialog,
              "webkitTransitionEnd mozTransitionEnd MSTransitionEnd otransitionend transitionend",
              function () {
                DOMUtils.off(
                  dialog,
                  "webkitTransitionEnd mozTransitionEnd MSTransitionEnd otransitionend transitionend"
                );
                log.success("关闭楼中楼回复弹窗");
                dialog.remove();
                if (GM_Menu.get("baidu_tieba_lzl_ban_global_back")) {
                  resumeBack();
                }
              }
            );
          }
          /**
           * 关闭楼中楼弹窗(来自url改变)
           */
          function closeDialogByUrlChange() {
            dialog.removeAttribute("data-on");
            DOMUtils.on(
              dialog,
              "webkitTransitionEnd mozTransitionEnd MSTransitionEnd otransitionend transitionend",
              function () {
                DOMUtils.off(
                  dialog,
                  "webkitTransitionEnd mozTransitionEnd MSTransitionEnd otransitionend transitionend"
                );
                log.success("关闭楼中楼回复弹窗");
                dialog.remove();
              }
            );
          }
          /* 关闭图标的点击事件 */
          DOMUtils.on(
            dialog.querySelector(".whitesev-reply-dialog-close"),
            "click",
            closeDialog
          );
          /* 点击遮罩层则关闭弹窗 */
          DOMUtils.on(
            dialog.querySelector(".whitesev-reply-dialog-bg"),
            "click",
            closeDialog
          );
          /* 处理评论的头像点击新标签页打开主页 */
          DOMUtils.on(
            dialog,
            "click",
            ".whitesev-reply-dialog-avatar",
            function (event) {
              window.open(
                "/home/main?id=" +
                  event.target
                    .closest(".whitesev-reply-dialog-user-line")
                    .getAttribute("data-portrait"),
                "_blank"
              );
            }
          );
          /* 处理评论的名字点击新标签页打开主页 */
          DOMUtils.on(
            dialog,
            "click",
            ".whitesev-reply-dialog-user-info",
            function (event) {
              window.open(
                "/home/main?id=" +
                  event.target
                    .closest(".whitesev-reply-dialog-user-line")
                    .getAttribute("data-portrait"),
                "_blank"
              );
            }
          );
          /* 去除楼中楼回复@的超链接错误跳转 */
          dialog
            .querySelectorAll(".whitesev-reply-dialog-user-comment a[portrait]")
            .forEach((item) => {
              item.setAttribute(
                "href",
                "/home/main?id=" + item.getAttribute("portrait")
              );
              item.removeAttribute("onclick");
              item.removeAttribute("onmouseover");
              item.removeAttribute("onmouseout");
            });
          const lzlLoadingView = new LoadingView(false);
          /* 初始页数为2 */
          let lzlPage = 2;
          /* 处理楼中楼的滚动加载更多回复 */
          let lzlReplyCommentScrollEvent = async function (event) {
            let scrollElement = event.target;
            if (
              scrollElement.scrollTop + scrollElement.clientHeight + 50 <
              scrollElement.scrollHeight
            ) {
              return;
            }
            log.success("加载更多回复");
            lzlLoadingView.show();
            let replyInfo = await tiebaCommentConfig.getLzlCommentReply(
              tiebaCommentConfig.param_tid,
              data["userPostId"],
              lzlPage
            );
            log.success(replyInfo);
            if (replyInfo === "暂无更多回复") {
              log.error("暂无更多回复");
              lzlLoadingView.setText("暂无更多回复");
              DOMUtils.off(
                dialog.querySelector(".whitesev-reply-dialog-sheet-content"),
                "scroll"
              );
              log.error("取消绑定楼中楼scroll监听事件【下一页】");
              return;
            } else if (typeof replyInfo === "string") {
              lzlLoadingView.setText(replyInfo);
              return;
            }
            replyInfo["data"].forEach((item) => {
              let lastCommentHTML = `
              <div class="whitesev-reply-dialog-sheet-other-content-item">
                <div class="whitesev-reply-dialog-user-line" data-portrait="${item["userPortrait"]}">
                  <div class="whitesev-reply-dialog-avatar" style="background-image: url(${item["userAvatar"]});"></div>
                  <div class="whitesev-reply-dialog-user-info">
                    <div class="whitesev-reply-dialog-user-username">${item["userName"]}</div>
                  </div>
                </div>
                <div class="whitesev-reply-dialog-user-comment">${item["userReplyContent"]}</div>
                <div class="whitesev-reply-dialog-user-desc-info">
                    <span data-time="">${item["userReplyTime"]}</span>
                    <span data-ip=""></span>
                </div>
              </div>
              `;
              if (
                scrollElement.querySelector("." + loadingView.config.className)
              ) {
                DOMUtils.before(
                  scrollElement.querySelector(
                    "." + loadingView.config.className
                  ),
                  lastCommentHTML
                );
              } else {
                DOMUtils.append(
                  scrollElement.querySelector(
                    ".whitesev-reply-dialog-sheet-other-content"
                  ),
                  lastCommentHTML
                );
              }
            });
            /* 去除楼中楼回复@的超链接错误跳转 */
            scrollElement
              .querySelectorAll(
                ".whitesev-reply-dialog-user-comment a[portrait]"
              )
              .forEach((item) => {
                item.setAttribute(
                  "href",
                  "/home/main?id=" + item.getAttribute("portrait")
                );
                item.removeAttribute("onclick");
                item.removeAttribute("onmouseover");
                item.removeAttribute("onmouseout");
              });

            if (!replyInfo["nextPage"]) {
              log.error("暂无更多回复");
              lzlLoadingView.setText("暂无更多回复");
              DOMUtils.off(
                dialog.querySelector(".whitesev-reply-dialog-sheet-content"),
                "scroll"
              );
              log.error("取消绑定楼中楼scroll监听事件【下一页】");
              return;
            }
            lzlPage = replyInfo["nextPage"];
          };
          let lzlScrollEventLock = new utils.LockFunction(
            lzlReplyCommentScrollEvent,
            this
          );
          /* 监听楼中楼内滚动 */
          DOMUtils.on(
            dialog.querySelector(".whitesev-reply-dialog-sheet-content"),
            "scroll",
            lzlScrollEventLock.run
          );
          log.success("绑定楼中楼scroll监听事件【下一页】");
          /* 插入楼中楼弹窗 */
          document.body.appendChild(dialog);

          DOMUtils.append(
            dialog.querySelector(".whitesev-reply-dialog-sheet-other-content"),
            lzlLoadingView.getLoadingViewElement()
          );
          lzlLoadingView
            .getLoadingViewElement()
            .style.setProperty("color", "#c5c5c5");
          lzlLoadingView
            .getLoadingViewElement()
            .style.setProperty("font-size", "14px");
          lzlLoadingView.setText("加载更多");
          lzlLoadingView.hide();
          /* 延迟显示 */
          setTimeout(() => {
            dialog.setAttribute("data-on", true);
            this.vueRootView = document.querySelector(".main-page-wrap");
            log.success(["成功获取Vue根元素", this.vueRootView.__vue__]);
            if (GM_Menu.get("baidu_tieba_lzl_ban_global_back")) {
              banBack();
            }
          }, 0);
        },
        /**
         * 获取楼中楼评论
         * @param {string} tid 帖子id
         * @param {string} pid 回复主体id
         * @param {string|Number} pn 当前页
         */
        async getLzlCommentReply(tid = "", pid = "", pn = 1) {
          let getResp = await httpx.get({
            url: `https://tieba.baidu.com/p/comment?tid=${tid}&pid=${pid}&pn=${pn}&t=${new Date().getTime()}${
              tiebaCommentConfig.extraSearchSignParams
            }`,
            headers: {
              "User-Agent": utils.getRandomPCUA(),
              Host: "tieba.baidu.com",
              Referer: window.location.href,
            },
          });
          if (!getResp.status) {
            log.error(getResp);
            return "请求失败";
          }
          let respData = getResp.data;
          log.success(respData);
          let parseDOM = DOMUtils.parseHTML(respData.responseText, false, true);
          let lzlPostList = parseDOM.querySelectorAll("li.lzl_single_post");
          if (!lzlPostList.length) {
            return "暂无更多回复";
          }
          let result = {
            data: [],
          };
          lzlPostList.forEach((item) => {
            let dataFieldJSON = utils.toJSON(item.getAttribute("data-field"));
            let userName = dataFieldJSON["showname"];
            let userPostId = dataFieldJSON["spid"];
            let userPortrait = dataFieldJSON["portrait"];
            let userHomeUrl = item.querySelector("a[data-field]").href;
            let userAvatar = item.querySelector("a[data-field] img").src;
            let userReplyContent = item.querySelector(
              "span.lzl_content_main"
            ).innerHTML;
            let userReplyTime = item.querySelector("span.lzl_time").innerHTML;
            userReplyTime = utils.formatToTimeStamp(userReplyTime);
            userReplyTime =
              utils.getDaysDifference(
                new Date().getTime(),
                userReplyTime,
                "auto"
              ) + "前";
            result["data"].push({
              userName: userName,
              userPostId: userPostId,
              userPortrait: userPortrait,
              userHomeUrl: userHomeUrl,
              userAvatar: userAvatar,
              userReplyContent: userReplyContent,
              userReplyTime: userReplyTime,
            });
          });
          parseDOM.querySelectorAll("p.j_pager a").forEach((item) => {
            if (item.textContent.trim() === "下一页") {
              result["nextPage"] = parseInt(
                item.getAttribute("href").replace("#", "")
              );
            }
          });
          if (!result["data"].length) {
            return "解析回复失败";
          } else {
            return result;
          }
        },
        /**
         * 插入只看楼主的按钮
         */
        insertOnlyLZ() {
          let replySwitchElement = document.querySelector("#replySwitch");
          if (!replySwitchElement) {
            log.error("元素#replySwitch不存在");
            return;
          }
          let onlyLzInnerElement = DOMUtils.createElement("div", {
            style: `
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: center;
              -moz-box-align: center;
              -webkit-align-items: center;
              -moz-align-items: center;
              -ms-flex-align: center;
              align-items: center;
              line-height: .24rem;
              border-radius: .14rem;
              font-size: .13rem;
              color: #614ec2;
            `,
            class: "white-only-lz",
            textContent: "只看楼主",
          });
          replySwitchElement.appendChild(onlyLzInnerElement);
          let quxiaoonlylz_css = `
                      .white-only-lz-qx:before {
                          content: "取消";
                      }
                      .white-only-lz-none {
                          display: none;
                      }`;
          GM_addStyle(quxiaoonlylz_css);
          DOMUtils.on(
            document.querySelector(".white-only-lz"),
            "click",
            (event) => {
              tiebaCommentConfig.displayComment(
                Array.from(event.currentTarget.classList)
              );
            }
          );
        },
        /**
         * 插入 正序=倒序的按钮
         */
        insertReverseBtn() {
          let replySwitchElement = document.querySelector("#replySwitch");
          if (!replySwitchElement) {
            log.error("元素#replySwitch不存在");
            return;
          }
          let btnElement = DOMUtils.createElement("div", {
            style: `
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: center;
              -moz-box-align: center;
              -webkit-align-items: center;
              -moz-align-items: center;
              -ms-flex-align: center;
              align-items: center;
              line-height: .24rem;
              border-radius: .14rem;
              font-size: .13rem;
              color: #614ec2;
              width: auto;
              margin-left: auto;
              margin-right: 15px;
            `,
            class: "white-btn-comment-reverse",
          });
          replySwitchElement.appendChild(btnElement);
          let btnCSS = `
                      .white-btn-comment:before {
                          content: "正序";
                      }
                      .white-btn-comment-reverse:before {
                          content: "倒序";
                      }
                      .white-btn-comment-reverse-none {
                          display: none;
                      }`;
          GM_addStyle(btnCSS);
          DOMUtils.on(".white-btn-comment-reverse", "click", (event) => {
            tiebaCommentConfig.removeScrollListener();
            DOMUtils.remove(".post-item");
            if (
              event.currentTarget.getAttribute("class") === "white-btn-comment"
            ) {
              event.currentTarget.setAttribute(
                "class",
                "white-btn-comment-reverse"
              );
              tiebaCommentConfig.mainPositive();
              log.info("获取评论===>正序");
            } else {
              event.currentTarget.setAttribute("class", "white-btn-comment");
              tiebaCommentConfig.mainReverse();
              log.info("获取评论===>倒序");
            }
          });
        },
        /**
         * 获取第XX页的评论（不包括楼中楼评论）
         * @param {string} url
         * @returns {?HTMLElement|string}
         */
        async getPageComment(url) {
          let getDetails = {
            url: url,
            headers: {
              "User-Agent": utils.getRandomPCUA(),
              Referer: "tieba.baidu.com",
            },
          };
          if (GM_Menu.get("baidu_tieba_request_with_cookie")) {
            log.success(
              GM_Menu.getShowTextValue("baidu_tieba_request_with_cookie")
            );
            getDetails.headers["Cookie"] = document.cookie;
          }
          let getResp = await httpx.get(getDetails);
          let respData = getResp.data;
          log.success(["获取第一页的评论", respData]);
          if (getResp.status) {
            let pageCommentHTMLElement = DOMUtils.parseHTML(
              respData.responseText,
              true,
              true
            );
            if (
              pageCommentHTMLElement.title === "百度安全验证" ||
              respData.finalUrl.startsWith("https://wappass.baidu.com")
            ) {
              log.error("触发百度安全验证 👇" + respData.finalUrl);
              log.error(respData);
              return "触发百度安全验证";
              /* let gotoBaiduWappass = confirm("触发百度安全验证，是否前往："+respData.finalUrl);
              if(gotoBaiduWappass){
                window.location.href = respData.finalUrl;
              } */
            } else {
              return pageCommentHTMLElement;
            }
          } else if (getResp.type === "onerror") {
            if (
              typeof respData.error === "string" &&
              respData.error.match("wappass.baidu.com")
            ) {
              let url = respData.error.match(/"(.*?)"/)[1];
              log.error("触发百度校验: " + url);
              let gotoBaiduWappass = confirm(
                "触发百度安全验证，是否前往：" + url
              );
              if (gotoBaiduWappass) {
                window.location.href = url;
              }
            } else {
              log.error("获取评论数据失败 👇");
              log.error(respData);
            }
          }
        },
        /**
         * 获取第XX页的所有楼中楼评论
         * @param {string} url
         * @returns { {commentList: any[], userList: any[]} }
         */
        async getPageCommentList(url) {
          let getResp = await httpx.get({
            url: url,
            headers: {
              Accept: "application/json, text/javascript, */*; q=0.01",
              "User-Agent": utils.getRandomPCUA(),
              Referer: "tieba.baidu.com",
            },
          });
          let respData = getResp.data;
          if (getResp.status) {
            let data = utils.toJSON(respData.responseText);
            log.success(["帖子评论信息JSON", data]);
            return {
              commentList: data["data"]["comment_list"],
              userList: data["data"]["user_list"],
            };
          } else if (getResp.type === "onerror") {
            log.error("取第一页的评论的评论数据失败 👇");
            log.error(getResp);
          }
        },
        /**
         * 插入加载中的html
         */
        insertLoadingHTML() {
          if (!loadingView.isExists()) {
            log.info("插入loading");
            loadingView.initLoadingView();
            loadingView.hide();
            document
              .querySelector(".main-page-wrap")
              .appendChild(loadingView.getLoadingViewElement());
          }
        },
        /**
         * 动态显示只看楼主
         * @param {Array} classlist
         */
        displayComment(classlist) {
          if (classlist.includes("white-only-lz-qx")) {
            document
              .querySelector(".white-only-lz")
              .classList.remove("white-only-lz-qx");
            document.querySelectorAll(".post-item").forEach((ele) => {
              ele.classList.remove("white-only-lz-none");
            });
          } else {
            document
              .querySelector(".white-only-lz")
              .classList.add("white-only-lz-qx");
            document.querySelectorAll(".post-item").forEach((ele) => {
              let landlord = ele.getAttribute("landlord");
              if (landlord == "0") {
                ele.classList.add("white-only-lz-none");
              }
            });
          }
        },
        /**
         * 查看-正序
         */
        async mainPositive() {
          tiebaCommentConfig.param_tid =
            window.location.pathname.match(/([0-9]+)/g)?.[0] ||
            document.querySelector(".app-view")?.__vue__?.thread?.id;
          if (!tiebaCommentConfig.param_tid) {
            log.error("贴吧：未找到本页参数p");
            return;
          }
          let dataBannerInfo = document
            .querySelector(".recommend-item")
            ?.getAttribute("data-banner-info");
          tiebaCommentConfig.param_forum_id =
            dataBannerInfo != null
              ? utils.toJSON(dataBannerInfo)["forum_id"]
              : document.querySelector(".app-view")?.__vue__?.forum?.id;
          if (!tiebaCommentConfig.param_forum_id) {
            return log.error("贴吧：获取参数data-banner-info失败");
          }

          let timeStamp = Date.now();
          tiebaCommentConfig.page = 1;
          loadingView.setText("Loading...", true);
          loadingView.show();
          let url = `https://tieba.baidu.com/p/totalComment?t=${timeStamp}&tid=${tiebaCommentConfig.param_tid}&fid=${tiebaCommentConfig.param_forum_id}&pn=${tiebaCommentConfig.page}&see_lz=0${tiebaCommentConfig.extraSearchSignParams}`;
          let pageUrl = `https://tieba.baidu.com/p/${tiebaCommentConfig.param_tid}?pn=${tiebaCommentConfig.page}${tiebaCommentConfig.extraSearchSignParams}`;
          let pageDOM = await tiebaCommentConfig.getPageComment(pageUrl);
          let pageCommentList = await tiebaCommentConfig.getPageCommentList(
            url
          );
          if (
            !pageDOM ||
            typeof pageDOM === "string" ||
            !pageCommentList.commentList
          ) {
            loadingView.setText(
              typeof pageDOM === "string" ? pageDOM : "获取评论失败"
            );
            log.error("评论数据获取失败");
            return;
          }
          log.info("成功获取第一页评论和其第一页的楼中楼评论");
          let jumpInputBrightDOM = pageDOM.querySelector(".jump_input_bright");
          tiebaCommentConfig.maxPage = 1;
          if (jumpInputBrightDOM) {
            tiebaCommentConfig.maxPage = parseInt(
              jumpInputBrightDOM.getAttribute("max-page")
            );
            tiebaCommentConfig.setNextPageScrollListener();
            log.info("当前为多页，执行监听");
          } else {
            let comments = pageDOM.querySelectorAll(".l_post.l_post_bright");
            comments = Array.from(comments);
            document
              .querySelectorAll(".post-item")
              .forEach((ele) => ele.remove());
            comments.shift();
            tiebaCommentConfig.floor_num = 1;
            comments.forEach((element) => {
              tiebaCommentConfig.insertNewCommentInnerElement(
                tiebaCommentConfig.getNewCommentInnerElement(
                  element,
                  pageCommentList
                )
              );
              tiebaCommentConfig.floor_num++;
            });
            loadingView.hide();
          }
          log.info(
            `共 ${tiebaCommentConfig.maxPage} 页评论，当前所在 ${tiebaCommentConfig.page} 页`
          );
        },
        /**
         * 查看-倒序
         */
        async mainReverse() {
          tiebaCommentConfig.param_tid =
            window.location.pathname.match(/([0-9]+)/g)?.[0] ||
            document.querySelector(".app-view")?.__vue__?.thread?.id;
          if (!tiebaCommentConfig.param_tid) {
            log.error("贴吧：未找到本页参数p");
            return;
          }
          let dataBannerInfo = document
            .querySelector(".recommend-item")
            ?.getAttribute("data-banner-info");
          tiebaCommentConfig.param_forum_id =
            dataBannerInfo != null
              ? utils.toJSON(dataBannerInfo)["forum_id"]
              : document.querySelector(".app-view")?.__vue__?.forum?.id;
          if (!tiebaCommentConfig.param_forum_id) {
            return log.error("贴吧：获取参数data-banner-info失败");
          }

          let timeStamp = Date.now();
          tiebaCommentConfig.page = 1;
          loadingView.setText("Loading...", true);
          loadingView.show();
          let url = `https://tieba.baidu.com/p/totalComment?t=${timeStamp}&tid=${tiebaCommentConfig.param_tid}&fid=${tiebaCommentConfig.param_forum_id}&pn=${tiebaCommentConfig.page}&see_lz=0${tiebaCommentConfig.extraSearchSignParams}`;
          let pageUrl = `https://tieba.baidu.com/p/${tiebaCommentConfig.param_tid}?pn=${tiebaCommentConfig.page}${tiebaCommentConfig.extraSearchSignParams}`;
          let pageDOM = await tiebaCommentConfig.getPageComment(pageUrl);
          let pageCommentList = await tiebaCommentConfig.getPageCommentList(
            url
          );
          if (
            !pageDOM ||
            typeof pageDOM === "string" ||
            !pageCommentList.commentList
          ) {
            loadingView.setText(
              loadingView.setText(
                typeof pageDOM === "string" ? pageDOM : "获取评论失败"
              )
            );
            log.error("评论数据获取失败");
            return;
          }
          log.info("成功获取第一页评论和其第一页的楼中楼评论");
          tiebaCommentConfig.maxPage = 1;
          let jumpInputBrightDOM = pageDOM.querySelector(".jump_input_bright");
          if (jumpInputBrightDOM) {
            tiebaCommentConfig.maxPage = parseInt(
              jumpInputBrightDOM.getAttribute("max-page")
            );
            tiebaCommentConfig.page = tiebaCommentConfig.maxPage;
            tiebaCommentConfig.setPrevPageScrollListener();
            log.info("当前为多页");
          } else {
            let comment = pageDOM.querySelectorAll(".l_post.l_post_bright");
            tiebaCommentConfig.maxPage = 1;
            comment = Array.from(comment);
            document
              .querySelectorAll(".post-item")
              .forEach((ele) => ele.remove());
            comment.shift();

            tiebaCommentConfig.floor_num = 1;
            comment.reverse();
            comment.forEach((element) => {
              tiebaCommentConfig.insertNewCommentInnerElement(
                tiebaCommentConfig.getNewCommentInnerElement(
                  element,
                  pageCommentList
                )
              );
              tiebaCommentConfig.floor_num++;
            });
            loadingView.hide();
          }
          log.info(
            `共 ${tiebaCommentConfig.maxPage} 页评论，当前所在 ${tiebaCommentConfig.page} 页`
          );
        },
        run() {
          let urlSignParams = new URLSearchParams(window.location.search);
          if (
            urlSignParams.has("p_tk") &&
            urlSignParams.has("p_sign") &&
            urlSignParams.has("p_signature")
          ) {
            log.error("当前页面是经过百度验证后的网站，添加验证参数");
            urlSignParams.forEach((value, key) => {
              if (["pn", "tid", "pid", "fid", "t", "see_lz"].includes(key)) {
                return;
              }
              log.success(`设置额外参数：${key}=${value}`);
              /* tiebaCommentConfig.extraSearchSignParams += `&${key}=${value}`; */
            });
            log.error([
              "百度验证后的参数👇",
              tiebaCommentConfig.extraSearchSignParams,
            ]);
          }
          utils.waitNode(".main-page-wrap").then(() => {
            GM_Menu.add({
              key: "baidu_tieba_lzl_ban_global_back",
              text: "回退关闭楼中楼回复",
              callback(data) {
                if (data.enable) {
                  alert(
                    "开启后，当在手机浏览器中使用屏幕左滑回退网页操作或者点击浏览器的回退到上一页按钮，不会触发回退上一页操作，而是会关闭当前查看的楼中楼的弹窗。"
                  );
                }
              },
            });
            tiebaCommentConfig.insertLoadingHTML();
          });
          utils
            .waitAnyNode(
              ".recommend-item[data-banner-info]",
              "div.app-view.transition-fade.pb-page-wrapper.mask-hidden .post-item"
            )
            .then(() => {
              DOMUtils.remove(".post-item");
              tiebaCommentConfig.initReplyDialogCSS();
              tiebaCommentConfig.mainPositive();
              tiebaCommentConfig.insertReverseBtn();
              tiebaCommentConfig.insertOnlyLZ();
            });

          utils.waitNodeWithInterval(".app-view", 10000).then(async () => {
            utils
              .waitPropertyByInterval(
                () => {
                  return document.querySelector(".app-view").__vue__;
                },
                () => {
                  return document.querySelector(".app-view").__vue__
                    .isHitMedicalPost;
                },
                undefined,
                10000
              )
              .then(() => {
                document.querySelector(".app-view").__vue__.isHitMedicalPost =
                  !1;
              });
            utils
              .waitPropertyByInterval(
                () => {
                  return document.querySelector(".app-view").__vue__;
                },
                () => {
                  return (
                    typeof document.querySelector(".app-view")?.__vue__?.thread
                      ?.reply_num === "number"
                  );
                },
                undefined,
                10000
              )
              .then(() => {
                tiebaCommentConfig.reply_num =
                  document.querySelector(".app-view").__vue__.thread.reply_num;
                log.success(
                  "当前帖子的回复数量：" + tiebaCommentConfig.reply_num
                );
              });
          });
          /* 此处是百度贴吧帖子的css，应对贴吧前端重新编译文件 */
          GM_addStyle(`
          .post-item[data-v-74eb13e2] {
              overflow: hidden;
              margin: .16rem .13rem 0;
          }
          .post-item .user-line-post[data-v-74eb13e2] {
              margin-bottom: .06rem;
          }
          .user-line-wrapper[data-v-188c0e84], .user-line[data-v-188c0e84] {
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
          }
          .user-line-wrapper[data-v-188c0e84] {
              -webkit-box-pack: justify;
              -moz-box-pack: justify;
              -webkit-justify-content: space-between;
              -moz-justify-content: space-between;
              -ms-flex-pack: justify;
              justify-content: space-between;
          }
          .post-item .content[data-v-74eb13e2] {
              padding-left: .44rem;
          }
          .user-line[data-v-188c0e84] {
              -webkit-box-align: center;
              -moz-box-align: center;
              -webkit-align-items: center;
              -moz-align-items: center;
              -ms-flex-align: center;
              align-items: center;
              -webkit-box-pack: left;
              -moz-box-pack: left;
              -webkit-justify-content: left;
              -moz-justify-content: left;
              -ms-flex-pack: left;
              justify-content: left;
          }
          .user-line-wrapper[data-v-188c0e84], .user-line[data-v-188c0e84] {
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
          }
          .user-line .avatar[data-v-188c0e84] {
              position: relative;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              width: .36rem;
              height: .36rem;
              margin-right: .08rem;
              border-radius: 50%;
              background-repeat: no-repeat;
              background-position: 50%;
              background-size: cover;
              -webkit-box-flex: 0;
              -webkit-flex: none;
              -ms-flex: none;
              flex: none;
          }
          .tbfe-1px-border {
              position: relative;
              border-radius: .08rem;
              font-size: 0;
          }
          .user-line .user-info[data-v-188c0e84] {
              position: relative;
              overflow: hidden;
              -webkit-box-flex: 0;
              -webkit-flex: none;
              -ms-flex: none;
              flex: none;
          }
          .user-line .avatar[data-v-188c0e84]:after {
              border-radius: 50%;
          }
          .tbfe-1px-border:after {
              content: "";
              position: absolute;
              z-index: 100;
              top: 0;
              left: 0;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              border: 1px solid rgba(0,0,0,.12);
              -webkit-transform-origin: 0 0;
              -ms-transform-origin: 0 0;
              transform-origin: 0 0;
              pointer-events: none;
          }
          .user-line .user-info .username[data-v-188c0e84],
          #whitesev-reply-dialog .whitesev-reply-dialog-user-username {
              display: -webkit-box;
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: center;
              -webkit-align-items: center;
              -ms-flex-align: center;
              align-items: center;
              overflow: hidden;
              font-size: .15rem;
              line-height: .28rem;
              white-space: nowrap;
              -o-text-overflow: ellipsis;
              text-overflow: ellipsis;
              color: #141414;
              font-weight: 400;
          }
          .user-line .user-info .desc-info[data-v-188c0e84] {
              display: -webkit-box;
              display: -webkit-flex;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-align: center;
              -webkit-align-items: center;
              -ms-flex-align: center;
              align-items: center;
              font-size: .12rem;
              line-height: .18rem;
              overflow: hidden;
              white-space: nowrap;
              -o-text-overflow: ellipsis;
              text-overflow: ellipsis;
              color: #a3a2a8;
          }
          .user-line .user-info .floor-info[data-v-188c0e84], .user-line .user-info .forum-info[data-v-188c0e84] {
              margin-right: .08rem;
          }
          .post-item .content .post-text[data-v-74eb13e2] {
              display: unset;
              font-size: .16rem;
              line-height: .24rem;
          }
          .thread-text[data-v-ab14b3fe] {
              font-size: .13rem;
              line-height: .21rem;
              color: #141414;
              text-align: justify;
              word-break: break-all;
          }
          .post-item .content .lzl-post[data-v-74eb13e2] {
              margin-top: .06rem;
          }
          .lzl-post[data-v-5b60f30b] {
              padding: .08rem .12rem;
              background: #f8f7fd;
              border-radius: .08rem;
          }
          .post-item .content .post-split-line[data-v-74eb13e2] {
              margin-top: .12rem;
              background-color: #ededf0;
              height: 1px;
              width: 200%;
              -webkit-transform: scale(.5);
              -ms-transform: scale(.5);
              transform: scale(.5);
              -webkit-transform-origin: top left;
              -ms-transform-origin: top left;
              transform-origin: top left;
          }
          .lzl-post .lzl-post-item[data-v-5b60f30b]:first-child {
              margin-top: 0;
          }
          .lzl-post .lzl-post-item[data-v-5b60f30b] {
              margin-top: .04rem;
          }
          .lzl-post .lzl-post-item .text-box[data-v-5b60f30b] {
              font-size: .13rem;
              line-height: .2rem;
          }
          .lzl-post .lzl-post-item .text-box .link[data-v-5b60f30b] {
              display: -webkit-inline-box;
              display: -webkit-inline-flex;
              display: -ms-inline-flexbox;
              display: inline-flex;
              -webkit-box-align: center;
              -webkit-align-items: center;
              -ms-flex-align: center;
              align-items: center;
              font-weight: 600;
              color: #a4a1a8;
          }
          .lzl-post .lzl-post-item .lzl-post-text[data-v-5b60f30b] {
              display: inline;
          }
          .thread-text[data-v-ab14b3fe] {
              font-size: .13rem;
              line-height: .26rem;
              color: #141414;
              text-align: justify;
              word-break: break-all;
          }
          .lzl-post .lzl-post-item .text-box .link .landlord[data-v-5b60f30b] {
              width: .28rem;
              height: .28rem;
              margin-left: .04rem;
          }
          .user-line .user-info .username .landlord[data-v-188c0e84],
          #whitesev-reply-dialog .landlord[data-v-188c0e84]{
              width: .28rem;
              height: .28rem;
              margin-left: .04rem
          }
          /* 修改@的颜色 */
          .text-content .at{
            color: #614FBC !important;
          }`);
          GM_addStyle(`
          .thread-text .BDE_Smiley {
              width: .2rem;
              height: .2rem;
              vertical-align: middle;
          }
          .thread-text .BDE_Image{
              margin-top: 8px;
              max-width: 350px;
              cursor: url(//tb2.bdstatic.com/tb/static-pb/img/cur_zin.cur),pointer;
              height: auto;
              width: auto;
              width: 100%;
          }
          .text-content .at{
              font-weight: 600;
              color: #a3a1a9;
          }`);
          /* 隐藏百度贴吧精选帖子的底部空栏 */
          GM_addStyle(`
          body > div.main-page-wrap > div.app-view.transition-fade.pb-page-wrapper.mask-hidden > div.placeholder,
          div.app-view.transition-fade.pb-page-wrapper.mask-hidden .post-item[data-track]{
            display: none;
          }`);
        },
      };

      /**
       * 其它功能
       */
      const tiebaOhterFunc = {
        /**
         * 注册全局贴吧图片点击预览(只预览通过贴吧上传的图片，非其它图床图片)
         */
        optimizeImagePreview() {
          /**
           * 查看图片
           * @param {Array} imgList
           * @param {Number} _index_
           */
          function viewIMG(imgList = [], _index_ = 0) {
            let viewerULNodeHTML = "";
            imgList.forEach((item) => {
              viewerULNodeHTML += `<li><img data-src="${item}" loading="lazy"></li>`;
            });
            let viewerULNode = DOMUtils.createElement("ul", {
              innerHTML: viewerULNodeHTML,
            });
            let viewer = new Viewer(viewerULNode, {
              inline: false,
              url: "data-src",
              zIndex: utils.getMaxZIndex() + 100,
              hidden: () => {
                viewer.destroy();
              },
            });
            _index_ = _index_ < 0 ? 0 : _index_;
            viewer.view(_index_);
            viewer.zoomTo(1);
            viewer.show();
          }
          DOMUtils.on(document, "click", "img", function (event) {
            let clickElement = event.target;
            let imgSrc =
              clickElement.getAttribute("data-src") ||
              clickElement.getAttribute("src");
            if (
              clickElement.parentElement.className === "viewer-canvas" ||
              clickElement.parentElement.hasAttribute("data-viewer-action")
            ) {
              return;
            }
            if (
              imgSrc?.match(/^http(s|):\/\/(tiebapic|imgsa).baidu.com\/forum/g)
            ) {
              log.info(`点击图片👇`);
              log.info(clickElement);
              if (clickElement.parentElement.className === "img-box") {
                /* 帖子主体内的图片 */
                let parentMain = clickElement.closest(
                  ".img-sudoku.main-img-sudoku"
                );
                log.info(parentMain);
                if (!parentMain) {
                  viewIMG([imgSrc]);
                  return;
                }
                utils.preventEvent(event);
                let lazyImgList = [];
                parentMain.querySelectorAll("img.img").forEach((item) => {
                  let _imgSrc_ =
                    item.getAttribute("data-src") || item.getAttribute("src");
                  log.info(`获取图片: ${_imgSrc_}`);
                  lazyImgList = [...lazyImgList, _imgSrc_];
                });
                log.info("图片列表👇");
                log.info(lazyImgList);
                viewIMG(lazyImgList, lazyImgList.indexOf(imgSrc));
              } else if (
                clickElement.parentElement.className === "text-content"
              ) {
                /* 评论区内的图片 */
                let parentMain = clickElement.parentElement;
                let lazyImgList = [];
                log.info(parentMain);
                parentMain.querySelectorAll("img.BDE_Image").forEach((item) => {
                  let _imgSrc_ =
                    item.getAttribute("data-src") || item.getAttribute("src");
                  log.info(`获取图片: ${_imgSrc_}`);
                  lazyImgList = [...lazyImgList, _imgSrc_];
                });
                log.info("评论区图片列表👇");
                log.info(lazyImgList);
                viewIMG(lazyImgList, lazyImgList.indexOf(imgSrc));
              } else {
                /* 单个图片预览 */
                viewIMG([imgSrc]);
              }
            }
          });
          DOMUtils.ready(function () {
            utils.waitNodeWithInterval("div.img-sudoku img", 10000).then(() => {
              let imgSudoKuElement = document.querySelector("div.img-sudoku");
              let imgSudoKuImageElementList =
                imgSudoKuElement.querySelectorAll("img.img");
              log.success([
                "重构主内容的图片",
                imgSudoKuElement,
                imgSudoKuImageElementList,
              ]);
              imgSudoKuImageElementList.forEach((element) => {
                if (element.hasAttribute("data-src")) {
                  element.src = element.getAttribute("data-src");
                }
              });
              /* 通过重新赋值innerHTML来覆盖原有的事件 */
              imgSudoKuElement.innerHTML = imgSudoKuElement.innerHTML;
            });
          });
        },
        /**
         * 重定向跳转
         */
        redirectJump() {
          log.info("话题热榜-阻止默认跳转");
          DOMUtils.on(document, "click", ".topic-share-item", function (event) {
            utils.preventEvent(event);
            window?.stop();
            let clickNode = event.target;
            let dataTrack = clickNode.getAttribute("data-track");
            if (dataTrack == null) {
              log.error("未找到data-track");
              log.error(clickNode);
              return false;
            }
            dataTrack = utils.toJSON(dataTrack);
            let tid = dataTrack["tid"];
            if (tid == null) {
              log.error("未找到tid");
              log.error(dataTrack);
              return false;
            }
            log.success(`跳转至: https://tieba.baidu.com/p/${tid}`);
            window.location.href = `https://tieba.baidu.com/p/${tid}`;
            return false;
          });
          utils.waitNodeList(".thread-bottom .forum").then((nodeList) => {
            log.success("设置贴吧种类正确跳转");
            log.success(nodeList);
            nodeList.forEach((item) => {
              item.ontouchstart = function (event) {
                utils.preventEvent(event);
                window?.stop();
                window.location.href = `https://tieba.baidu.com/f?kw=${DOMUtils.text(
                  event.target
                )
                  .trim()
                  .replace(/吧$/g, "")}`;
                return false;
              };
            });
          });
          utils
            .waitNode(".topic-share-thread .list-content")
            .then((element) => {
              utils.mutationObserver(element, {
                callback: (mutations) => {
                  mutations.forEach((item) => {
                    item.addedNodes.forEach((item2) => {
                      if (
                        typeof item2.className === "string" &&
                        item2.className.includes("topic-share-item")
                      ) {
                        log.success("设置新增的帖子的贴吧种类正确跳转");
                        log.success(item2);
                        item2.querySelector(
                          ".thread-bottom .forum"
                        ).ontouchstart = function (event) {
                          utils.preventEvent(event);
                          window?.stop();
                          window.location.href = `https://tieba.baidu.com/f?kw=${DOMUtils.text(
                            event.target
                          )
                            .trim()
                            .replace(/吧$/g, "")}`;
                          return false;
                        };
                      }
                    });
                  });
                },
                config: {
                  childList: true,
                  subtree: true,
                },
              });
            });

          DOMUtils.on(
            document,
            "touchstart",
            ".topic-share-item .forum",
            function (event) {
              return utils.preventEvent(event);
            }
          );
        },
      };

      /**
       * 贴吧搜索
       */
      const tiebaSearchConfig = {
        isSetClickEvent: false,
        searchSuggestion: null,
        /**
         * 获取搜索建议
         * @param {string} queryText 搜索内容
         * @async
         */
        async getSuggestion(queryText = "") {
          let getResp = await httpx.get({
            url: `https://tieba.baidu.com/suggestion?query=${queryText}&ie=utf-8&_=${new Date().getTime()}`,
            headers: {
              "User-Agent": utils.getRandomPCUA(),
              Accept: "application/json, text/javascript, */*; q=0.01",
              Host: "tieba.baidu.com",
              Referer: window.location.href,
            },
          });
          if (!getResp.status) {
            return;
          }
          let respData = getResp.data;
          return utils.toJSON(respData.responseText);
        },
        run() {
          this.setSuggestionCSS();
          utils.waitNode("div.more-btn-desc").then((element) => {
            element.outerHTML = `
              <input type="search" id="tieba-search" placeholder="请输入搜索内容..." style="display: none;padding: 0 10px;height: 32px;line-height: 32px;font-size: 14px;border-radius: 5px;box-sizing: border-box;-webkit-appearance: none;-moz-appearance: none;-o-appearance: none;appearance: none;border: 1px solid #000000;outline: none;flex: 1;margin: 0px 40px;" autocomplete="off">
              <div class="more-btn-desc" style="margin-right: 13px;font-size: .15rem;font-weight: 700;color: #614ec2;">搜索</div>
              `;
            DOMUtils.on(
              document.querySelector("div.more-btn-desc"),
              "click",
              function () {
                let searchParams = new URLSearchParams(window.location.search);
                if (
                  window.location.pathname === "/f" &&
                  utils.isNotNull(searchParams.get("kw"))
                ) {
                  /* 当前是在吧内，搜索按钮判定搜索贴子 */
                  loadingView.removeAll();
                  loadingView.initLoadingView();
                  DOMUtils.after(
                    document.querySelector("div.tb-page__main"),
                    loadingView.getLoadingViewElement()
                  );
                  tiebaSearchConfig.isSetClickEvent = true;
                  tiebaSearchConfig.postsSearch();
                } else if (
                  window.location.href.startsWith("https://tieba.baidu.com/p/")
                ) {
                  /* 当前是在帖子内，搜索按钮判定搜索贴子 */
                  if (!tiebaSearchConfig.isSetClickEvent) {
                    tiebaSearchConfig.isSetClickEvent = true;
                    tiebaSearchConfig.postsSearch();
                  }
                } else {
                  /* 当前是在主页中，搜索按钮判定为搜索吧 */
                  tiebaSearchConfig.frontPageSeach();
                  utils.listenKeyboard(
                    document.querySelector("#tieba-search"),
                    "keypress",
                    (keyName) => {
                      if (keyName === "Enter") {
                        tiebaSearchConfig.frontPageSeach();
                      }
                    }
                  );
                }
              }
            );

            this.searchSuggestion = new SearchSuggestion({
              isAbsolute: false,
              showDeleteIcon: false,
              targetElement: document.querySelector("#tieba-search"),
              getItemValue: function (item) {
                return item.fname;
              },
              getItemHTML: function (itemData) {
                return `
                  <div class="forum_item">
                    <img class="forum_image" src="${itemData.fpic}">
                    <div class="forum_right">
                      <div class="forum_name">${itemData.fname}</div>
                      <div class="forum_desc">${itemData.forum_desc}</div>
                    </div>
                  </div>`;
              },
              /**
               * 输入框内容改变触发的事件
               * @param {{
               * text: string,
               * data: array,
               * showData: array
               * }} info
               */
              searchInputChangeCallBack: async (info) => {
                /* 
                  {
                      "text": "r",
                      "data": [],
                      "showData": []
                  }
                  */
                let searchText = info.text;
                let result = [];
                log.success("搜索中...");
                let suggestionData = await tiebaSearchConfig.getSuggestion(
                  searchText
                );
                if (utils.isNull(suggestionData)) {
                  return result;
                }
                log.success(suggestionData);
                result = suggestionData.query_match.search_data || [];
                return result;
              },
              clickItemCallBack: (text) => {
                window.location.href =
                  "https://tieba.baidu.com/f?ie=utf-8&kw=" + text;
              },
            });
            log.success("初始化默认搜索...");
            tiebaSearchConfig.searchSuggestion.config
              .searchInputChangeCallBack({
                text: "",
                data: [],
                showData: [],
              })
              .then((result) => {
                if (result.length) {
                  tiebaSearchConfig.searchSuggestion.update(result);
                }
              });
          });
        },
        setSuggestionCSS() {
          GM_addStyle(`
              .WhiteSevsSearchSelect .forum_item{
                /* height: 32px;
                padding: 6px 8px;
                line-height: 16px; */
                display: flex;
                text-wrap: wrap;
              }
              .WhiteSevsSearchSelect .forum_image{
                float: left;
                width: 32px;
                height: 32px;
              }
              .WhiteSevsSearchSelect .forum_right{
                /* height: 32px; */
                float: left;
                margin-left: 8px;
                color: #999;
                width: 88%;
              }
              .WhiteSevsSearchSelect .forum_name{
                color: #000;
                font-size: 14px;
                font-weight: 700;
              }
              .WhiteSevsSearchSelect .forum_name::after{
                content:"吧";
              }
              `);
        },
        /**
         * 帖子外搜索(也就是首页搜索吧)
         */
        frontPageSeach() {
          log.success("当前是在首页");
          let searchInputElement = document.querySelector("#tieba-search");
          let searchText = searchInputElement.value.trim();
          /* 搜索框隐藏的话就显示出来 */
          if (getComputedStyle(searchInputElement).display === "none") {
            searchInputElement.previousElementSibling.style.display = "none";
            searchInputElement.style.display = "block";
          } else {
            /* 已显示出来的话就跳转搜索 */
            if (utils.isNull(searchText)) {
              alert("请勿输入空内容");
              return;
            }
            window.location.href =
              "https://tieba.baidu.com/f?ie=utf-8&kw=" + searchText;
          }
        },
        /**
         * 帖子内搜索(搜索帖子)
         * */
        postsSearch() {
          let that = this;
          let gbkEncoder = new utils.GBKEncoder();
          let nextPageUrl = null;
          let lockFunction = null;
          /**
           * 0 按时间顺序
           * 1 按时间倒序
           * 2 按相关性顺序
           * 3 只看主题贴
           */
          let searchModel = 1;
          /**
           * 0 吧内搜索
           * 1 全吧搜索
           */
          let searchType = 0;
          /**
           * 获取搜索结果
           * @param {string} [qw=""] 搜索的关键字
           * @param {number} [pn=0] 当前页码
           * @param {number} [sm=0] 搜索结果排序
           * @param {string} [kw=""] 搜索的目标吧，留空是全部
           * 0 按时间顺序
           * 1 按时间倒序 如果加上only_thread为1，就是只看主题贴
           * 2 按相关性顺序
           * @returns {Promise}
           */
          async function getSearchResult(qw = "", pn = 0, sm = 1, kw = "") {
            if (sm === 3) {
              sm = "1&only_thread=1";
            }
            let url = "";
            let originText = "";
            if (arguments.length === 1) {
              url = arguments[0];
              log.success(`请求的下一页url: ${url}`);
            } else {
              originText = qw;
              qw = gbkEncoder.encode(qw);
              kw = gbkEncoder.decode(kw);
              kw = gbkEncoder.encode(kw);
              log.success(`搜索内容gbk编码转换: ${originText} => ${qw}`);
              url = `https://tieba.baidu.com/f/search/res?isnew=1&kw=${kw}&qw=${qw}&un=&rn=10&pn=${pn}&sd=&ed=&sm=${sm}`;
            }

            log.success(
              `当前请求第 ${new URLSearchParams(new URL(url).search).get(
                "pn"
              )} 页`
            );
            let getResp = await httpx.get({
              url: url,
              headers: {
                Referer: window.location.href,
                Host: "tieba.baidu.com",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              },
              responseType: "html",
            });
            if (!getResp.status) {
              if (getResp.data.responseText === "") {
                log.error(getResp);
                return "获取内容为空，可能触发了百度校验，请刷新网页再试";
              } else if (
                getResp.data &&
                getResp.data?.responseText?.match("wappass.baidu.com")
              ) {
                let url = getResp.data.responseText.match(/href="(.*?)"/)[1];
                log.error("触发百度校验: " + url);
                window.location.href = url;
                return "触发百度校验";
              }
              log.error(getResp);
              return;
            }
            log.success(getResp);
            let respData = getResp.data;
            let searchDoc = DOMUtils.parseHTML(
              respData.responseText,
              true,
              true
            );
            if (searchDoc.querySelector(".search_noresult")) {
              return "抱歉，没有找到与“" + originText + "”相关的结果。";
            }
            let result = [];
            nextPageUrl = searchDoc.querySelector(".pager-search a.next")?.href;
            searchDoc
              .querySelectorAll(".s_main .s_post_list .s_post")
              .forEach((item) => {
                if (item.id === "post_user" || item.id === "no_head") {
                  return;
                }
                let url = item.querySelector("span.p_title a").href;
                let title = item.querySelector("span.p_title a").innerHTML;
                let content = item.querySelector(".p_content").innerHTML;
                /* 来自哪个贴吧 */
                let forum = item.querySelector(
                  "a.p_forum font.p_violet"
                ).textContent;
                let author = (
                  item.querySelector("a[href^='/home'] font.p_violet") ||
                  item.querySelectorAll("font.p_violet")[1]
                ).textContent;
                let authorHomeUrl =
                  "https://tieba.baidu.com/home/main?un=" +
                  gbkEncoder.encode(author);
                let time = item.querySelector(".p_date").textContent;
                result = [
                  ...result,
                  {
                    url: url,
                    title: title,
                    content: content,
                    forum: forum,
                    author: author,
                    authorHomeUrl: authorHomeUrl,
                    time: time,
                  },
                ];
              });
            return result;
          }
          function getItemHTML(item) {
            return `
                    <div class="s_post">
                      <span class="p_title">
                        <a href="${item["url"]}" target="_blank">${item["title"]}</a>
                      </span>
                      <div class="p_content">${item["content"]}</div>
                      <div>
                        <a class="p_forum" href="https://tieba.baidu.com/f?kw=${item["forum"]}" target="_blank">
                          <font class="p_violet">${item["forum"]}</font>
                        </a>
                      </div>
                      <div>
                        <a class="p_author" href="${item["authorHomeUrl"]}" target="_blank">
                          <font class="p_violet">${item["author"]}</font>
                        </a>
                      </div>
                      <div>
                        <font class="p_date">${item["time"]}</font>
                      </div>
                    </div>`;
          }
          function setCSS() {
            GM_addStyle(`
            .s_post,
            .s_order,
            .s_search {
              margin: 25px;
            }
            .s_post .p_title{
                
            }
            .s_post .p_content{
              overflow-wrap: break-word;
            }
            .s_post em{
              color: #e10900;
              font-style: normal;
            }
            .s_post a.p_forum::before{
              content:"贴吧：";
              color: #000000;
            }
            .s_post a.p_author::before{
              content:"作者：";
              color: #000000;
            }
            .s_post font.p_date::before{
              content:"时间：";
              color: #000000;
            }
            .s_post font.p_date{
                color: green;
            }
            .s_order a{
              color: -webkit-link;
            }
            `);
          }

          /**
           * 设置搜索结果模式
           * @param {Element} searchElement
           * @param {Element} orderElement
           */
          function setCurrentOrderHTML(searchElement, orderElement) {
            for (const targetElement of orderElement.querySelectorAll("a")) {
              let targetElementHTML = DOMUtils.html(targetElement);
              let flag = false;
              if (
                (targetElementHTML.includes("按时间顺序") &&
                  searchModel === 0) ||
                (targetElementHTML.includes("按时间倒序") &&
                  searchModel === 1) ||
                (targetElementHTML.includes("按相关性顺序") &&
                  searchModel === 2) ||
                (targetElementHTML.includes("只看主题贴") && searchModel === 3)
              ) {
                flag = true;
              }
              if (flag) {
                log.success(`当前搜索模式-${targetElementHTML}`);
                DOMUtils.replaceWith(
                  targetElement,
                  `<b>${targetElementHTML}</b>`
                );
                break;
              }
            }
            if (searchType === 1) {
              DOMUtils.val(searchElement.querySelector("#searchtb"), true);
              log.success("当前搜索类型-全吧搜索");
            } else if (searchType === 0) {
              log.success("当前搜索类型-吧内搜索");
            } else {
              log.error("未知的搜索类型，请排查");
            }
          }
          /**
           * 设置搜索结果模式点击事件
           */
          function setOrderClickEvent() {
            DOMUtils.on(document, "click", ".s_order a", function (event) {
              let clickOrderElement = event.target;
              let clickOrderHTML = DOMUtils.html(clickOrderElement);
              let orderBElement = document.querySelector(".s_order b");
              DOMUtils.replaceWith(
                orderBElement,
                `<a>${DOMUtils.html(orderBElement)}</a>`
              );
              clickOrderElement.replaceWith(`<b>${clickOrderHTML}</b>`);
              if (clickOrderHTML.includes("按时间顺序")) {
                searchModel = 0;
                log.success("设置当前搜索模式-按时间顺序");
              } else if (clickOrderHTML.includes("按相关性顺序")) {
                searchModel = 2;
                log.success("设置当前搜索模式-按相关性顺序");
              } else if (clickOrderHTML.includes("只看主题贴")) {
                searchModel = 3;
                log.success("设置当前搜索模式-只看主题贴");
              } else {
                searchModel = 1;
                log.success("设置当前搜索模式-按时间倒序");
              }
              nextPageUrl = null;
              removeScrollListener();
              document.querySelector(".more-btn-desc").click();
            });
            DOMUtils.on(
              document,
              "change",
              ".s_search input[type='radio']",
              function (event) {
                if (event.target.id === "searchtb") {
                  searchType = 1;
                  log.success("切换搜索模式-全吧搜索");
                } else if (event.target.id === "nowtb") {
                  searchType = 0;
                  log.success("切换搜索模式-吧内搜索");
                } else {
                  log.error("未知的搜索类型，请排查");
                }
              }
            );
          }
          async function _click_event_() {
            tiebaCommentConfig.removeScrollListener();
            let contentElement =
              document.querySelector(".main-thread-content-margin") ||
              document.querySelector(".main-thread-content") ||
              document.querySelector(".tb-page__main");
            DOMUtils.remove("#replySwitch");
            DOMUtils.remove(".post-item");
            DOMUtils.html(contentElement, "");
            searchInputElement.focus();
            let searchText = searchInputElement.value.trim();
            if (utils.isNull(searchText)) {
              alert("请勿输入纯空格或空内容");
              return;
            }
            loadingView.setText("Loading...", true);
            loadingView.show();
            if (searchType === 0) {
              if (utils.isNull(tiebaInfo.forumName)) {
                loadingView.hide();
                alert("获取当前吧失败");
                return;
              }
              log.success("当前搜索的范围吧：" + tiebaInfo.forumName);
            }
            let searchResult = await getSearchResult(
              searchText,
              undefined,
              searchModel,
              tiebaInfo.forumName
            );
            tiebaCommentConfig.removeScrollListener();
            if (!searchResult) {
              loadingView.hide();
              alert("请求失败，详情请看控制台");
              return;
            }
            if (
              typeof searchResult === "string" &&
              (searchResult.startsWith("抱歉") ||
                searchResult.startsWith("获取内容为空"))
            ) {
              DOMUtils.html(contentElement, "");
              searchModel = 1;
              loadingView.hide();
              alert(searchResult + " 已重置搜索模式为-按时间倒序");
              return;
            }
            DOMUtils.html(contentElement, "");
            log.success(searchResult);
            let searchElement = DOMUtils.createElement("div", {
              class: "s_search",
              innerHTML: `
              搜索类型：
              <input id="nowtb" name="tb" type="radio"checked="checked">
              <label for="nowtb">吧内搜索</label>
              <input id="searchtb" name="tb" type="radio">
              <label for="searchtb">全吧搜索</label>`,
            });
            let orderElement = DOMUtils.createElement("div", {
              class: "s_order",
              innerHTML: `
              排序结果：
              <a>按时间倒序</a>
              <span class="split_line">|</span>
              <a>按时间顺序</a>
              <span class="split_line">|</span>
              <a>按相关性顺序</a>
              <span class="split_line">|</span>
              <a>只看主题贴</a>
              <span class="split_line">|</span>
              `,
            });
            setCurrentOrderHTML(searchElement, orderElement);
            DOMUtils.append(contentElement, searchElement);
            DOMUtils.append(contentElement, orderElement);
            searchResult.forEach((item) => {
              DOMUtils.append(contentElement, getItemHTML(item));
            });
            loadingView.hide();
            if (nextPageUrl) {
              addScrollListener();
            }
          }
          /**
           * 添加滚动监听
           */
          function addScrollListener() {
            document.addEventListener("scroll", lockFunction.run);
            log.success("添加scroll事件监听");
          }
          /**
           * 移除滚动监听
           */
          function removeScrollListener() {
            document.removeEventListener("scroll", lockFunction.run);
            log.success("移除scroll事件监听");
          }
          /**
           * 滚动事件
           */
          async function _scroll_event_() {
            if (!utils.isNearBottom()) {
              return;
            }
            loadingView.show();
            if (!nextPageUrl) {
              removeScrollListener();
              log.success("已到达最后一页");
              loadingView.show();
              return;
            }
            let contentElement =
              document.querySelector(".main-thread-content-margin") ||
              document.querySelector(".main-thread-content") ||
              document.querySelector(".tb-page__main");
            let searchResult = await getSearchResult(nextPageUrl);
            if (!searchResult) {
              loadingView.hide();
              alert("请求下一页失败，详情请看控制台");
              return;
            }
            if (
              typeof searchResult === "string" &&
              (searchResult.startsWith("抱歉") ||
                searchResult.startsWith("获取内容为空"))
            ) {
              loadingView.hide();
              alert(searchResult);
              return;
            }
            log.success(searchResult);
            searchResult.forEach((item) => {
              DOMUtils.append(contentElement, getItemHTML(item));
            });
            loadingView.hide();
            if (!nextPageUrl) {
              removeScrollListener();
              log.success("已到达最后一页");
              return;
            }
          }
          log.success("当前是在吧内");
          lockFunction = new utils.LockFunction(_scroll_event_, this);
          tiebaCommentConfig.removeScrollListener();
          this.searchSuggestion.removeTargetInputEvent();
          let searchInputElement = document.querySelector("#tieba-search");
          /* 搜索框显示出来 */
          searchInputElement.previousElementSibling.style.display = "none";
          searchInputElement.style.display = "block";
          document
            .querySelector(".more-btn-desc")
            .addEventListener("click", _click_event_);
          utils.listenKeyboard(
            searchInputElement,
            "keypress",
            (keyName, keyValue, otherKeyList, event) => {
              if (keyName === "Enter") {
                _click_event_(event);
              }
            }
          );
          setOrderClickEvent();
          setCSS();
        },
      };

      /**
       * 贴吧其它功能
       */
      const tiebaBusiness = {
        vueRootView: null,
        run() {
          /* 修改页面中的APP内签到 */
          utils.waitNode(".tb-mobile-viewport").then(async () => {
            tiebaBusiness.vueRootView = document.querySelector(
              ".tb-mobile-viewport"
            ).__vue__;
            if (!tiebaBusiness.vueRootView["user"]["is_login"]) {
              return;
            }
            utils.waitNode(".tb-forum-user__join-btn").then((element) => {
              log.success("修改页面中的APP内签到");
              DOMUtils.on(element, "click", function (event) {
                utils.preventEvent(event);
                let userPortrait =
                  tiebaBusiness.vueRootView["user"]["portrait"];
                let forumName = tiebaBusiness.vueRootView["forum"]["name"];
                let tbs =
                  tiebaBusiness.vueRootView["$store"]["state"]["common"]["tbs"];
                tiebaBusiness.sign(forumName, tbs);
              });
            });
          });
        },
        /**
         * 签到
         * @param {string} forumName 贴吧名
         * @param {string} tbs 应该是用户token
         */
        async sign(forumName, tbs) {
          log.success(["发送签到请求→", forumName, tbs]);
          let postResp = await httpx.post("https://tieba.baidu.com/sign/add", {
            data: `ie=utf-8&kw=${forumName}&tbs=${tbs}`,
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "accept-language":
                "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
              "cache-control": "no-cache",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              referer: window.location.href,
            },
          });
          log.error(postResp);
          if (!postResp.status) {
            tiebaBusiness.vueRootView.$toast("签到请求失败，请查看控制台");
            return;
          }
          let respData = utils.toJSON(postResp.data.responseText);
          log.success(respData);
          if (typeof respData["data"] === "object") {
            tiebaBusiness.vueRootView.$toast(
              `签到排名：今日本吧第${respData["data"]["finfo"]["current_rank_info"]["sign_count"]}个签到排名`
            );
          } else {
            tiebaBusiness.vueRootView.$toast(respData["error"]);
          }
        },
        /**
         * 客户端已调用伪装
         */
        clientCallMasquerade() {
          let originGetItem = window.localStorage.getItem;
          /* 劫持localStorage */
          window.localStorage.getItem = function (key) {
            if (
              key === "p_w_app_call" ||
              key === "p_w_launchappcall" ||
              key === "loginWakeModal"
            ) {
              log.info("客户端已调用伪装 " + key);
              return JSON.stringify({
                value: 1,
                date: utils.formatTime(undefined, "yyyyMMdd"),
              });
            } else if (
              key.startsWith("p_w_new_slient") ||
              key.startsWith("f_w_slient") ||
              key.startsWith("f_w_pop_slient") ||
              key.startsWith("f_w_floor") ||
              key.startsWith("t_w_slient") ||
              key.startsWith("t_w_pop_slient") ||
              key.startsWith("auto_slient_wakeup")
            ) {
              log.info("客户端已调用伪装 " + key);
              return "1";
            } else {
              return originGetItem.call(window.localStorage, key);
            }
          };
          /* 伪装localStorage已赋值 */
          let masqueradeParamsList = [
            "p_w_new_slient_",
            "f_w_slient_",
            "f_w_pop_slient_",
            "f_w_floor_",
            "t_w_slient_",
            "t_w_pop_slient_",
            "auto_slient_wakeup_",
          ];
          masqueradeParamsList.forEach((masqueradeParam) => {
            window.localStorage.setItem(
              masqueradeParam + utils.formatTime(undefined, "yyyy-MM-dd"),
              1
            );
          });
          for (let index = 0; index < window.localStorage.length; index++) {
            let keyName = window.localStorage.key(index);
            masqueradeParamsList.forEach((item) => {
              if (
                keyName.startsWith(item) &&
                !keyName.endsWith(utils.formatTime(undefined, "yyyy-MM-dd"))
              ) {
                log.success("删除过期键 ===> " + keyName);
                window.localStorage.removeItem(keyName);
              }
            });
          }
        },
        /**
         * 获取本帖楼主的信息
         * @returns {?{
         *   id: number,
         *   name: string,
         *   name_show: string,
         *   portrait: string,
         *   show_nickname: string,
         *   type: number,
         *   userhide: number,
         * }}
         */
        getLandlordInfo() {
          return document.querySelector(
            ".main-page-wrap .user-line-wrapper.thread-user-line"
          )?.__vue__?.$props?.author;
        },
        /**
         * 获取当前的贴吧名字
         * @returns {string}
         */
        getCurrentForumName() {
          let tbMobileViewport = document.querySelector(".tb-mobile-viewport")
            ?.__vue__?.forum?.name;
          let mainPageWrap =
            document.querySelector(".main-page-wrap")?.__vue__?.$children[0]
              ?.$children[0]?.forum?.name;
          let tbForum = document.querySelector(".tb-mobile-viewport .tb-forum")
            ?.__vue__?.forum?.name;
          let appView =
            document.querySelector(".app-view")?.__vue__?.forum?.name;
          return tbMobileViewport || mainPageWrap || tbForum || appView;
        },
        /**
         * 添加滚动到顶部按钮
         */
        addScrollTopButton() {
          if (!GM_Menu.get("baidu_tieba_add_scroll_top_button_in_forum")) {
            return;
          }
          log.success(
            GM_Menu.getShowTextValue(
              "baidu_tieba_add_scroll_top_button_in_forum"
            )
          );
          let isInsertButton = false;
          let showScrollTopButton = function () {
            isInsertButton = true;
            let buttonElement = DOMUtils.parseHTML(
              `
            <div class="tb-totop whitesev-tb-totop">
              <style>
              .whitesev-tb-totop{
                position: fixed;
                right: .09rem;
                bottom: 1rem;
                z-index: 1000;
              }
              .whitesev-tb-totop .tb-totop__span{
                display: inline-block;
                width: .51rem;
                height: .51rem;
              }
              .whitesev-tb-totop .tb-totop__svg{
                width: 100%;
                height: 100%;
              }
              </style>
              <span class="tb-totop__span">
                <svg class="tb-totop__svg">
                  <use xlink:href="#icon_frs_top_50"></use>
                </svg>
              </span>
            </div>`,
              true,
              false
            );
            DOMUtils.on(buttonElement, "click", function () {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
              });
            });
            document.body.appendChild(buttonElement);
          };
          let hideScrollTopButton = function () {
            isInsertButton = false;
            document.querySelector(".whitesev-tb-totop")?.remove();
          };
          let checkScroll = new utils.LockFunction(
            function () {
              let scrollTop =
                window.document.documentElement.scrollTop ||
                window.document.body.scrollTop;
              let scrollHeight =
                window.innerHeight ||
                document.documentElement.clientHeight ||
                window.document.body.clientHeight;
              if (scrollTop > scrollHeight * 2) {
                /* 页面中不存在该按钮元素才显示 */
                if (!isInsertButton) {
                  showScrollTopButton();
                }
              } else {
                /* 隐藏 */
                hideScrollTopButton();
              }
            },
            this,
            50
          );
          window.addEventListener("scroll", checkScroll.run);
        },
        /**
         * 添加顶部的楼主头像/名字的点击事件-直接进入楼主的个人主业
         */
        addAuthorClickEvent() {
          utils
            .waitNode("div.main-page-wrap .main-thread-content .user-line")
            .then((element) => {
              DOMUtils.on(element, "click", function () {
                let vueInfo =
                  element.parentElement?.__vue__ ||
                  element.closest(".user-line-wrapper")?.__vue__;
                let authorInfo = vueInfo.author;
                if (!authorInfo) {
                  log.error("获取贴主信息失败", vueInfo);
                  return;
                }
                log.success(["贴主信息", authorInfo]);
                window.open(`/home/main?id=${authorInfo.portrait}`);
              });
            });
        },
      };

      /**
       * 贴吧 吧内功能
       */
      const tiebaBaNei = {
        /**
         * 记住当前用户的看帖排序
         * + -1 不知道什么作用
         * + 1  不知道什么作用
         * + 2  回复
         * + 3  发布
         */
        rememberPostSort() {
          GM_Menu.add({
            key: "baidu_tieba_remember_user_post_sort",
            text: "记住当前选择的看帖排序",
            enable: true,
          });
          if (!GM_Menu.get("baidu_tieba_remember_user_post_sort")) {
            return;
          }
          let userSortModel = parseInt(
            GM_getValue("baidu-tieba-sort-model", 3)
          );
          utils
            .waitNode(".tb-page__main .tb-sort .tab-pack")
            .then((element) => {
              let originChange = element.__vue__.change;
              originChange(userSortModel);
              element.__vue__.change = function (index) {
                GM_setValue("baidu-tieba-sort-model", index);
                originChange(index);
              };
              log.info("注入记住当前选择的看帖排序");
            });
        },
      };

      GM_Menu.add([
        {
          key: "baidu_tieba_add_search",
          text: "新增搜索功能",
          enable: true,
        },
        {
          key: "baidu_tieba_add_scroll_top_button_in_forum",
          text: "新增贴内滚动到顶部按钮",
          enable: true,
        },
        {
          key: "baidu_tieba_optimize_see_comments",
          text: "优化查看评论",
          enable: true,
        },
        {
          key: "baidu_tieba_optimize_image_preview",
          text: "优化图片预览",
          enable: true,
        },
        {
          key: "baidu_tieba_hijack_wake_up",
          text: "劫持唤醒",
          enable: false,
        },
        {
          key: "baidu_tieba_request_with_cookie",
          text: "【beta】请求携带Cookie",
          enable: false,
        },
      ]);
      tiebaBusiness.clientCallMasquerade();
      baiduHijack.hijackElementAppendChild();
      if (GM_Menu.get("baidu_tieba_hijack_wake_up")) {
        log.success(GM_Menu.getShowTextValue("baidu_tieba_hijack_wake_up"));
        baiduHijack.hijackFunctionCall_WebPack_TieBa();
      }
      GM_addStyle(this.css.tieba);
      log.info("插入CSS规则");
      if (this.url.match(/^http(s|):\/\/(tieba.baidu|www.tieba).com\/p\//g)) {
        if (GM_Menu.get("baidu_tieba_optimize_see_comments")) {
          log.success(
            GM_Menu.getShowTextValue("baidu_tieba_optimize_see_comments")
          );
          tiebaCommentConfig.run();
        }
        if (GM_Menu.get("baidu_tieba_optimize_image_preview")) {
          log.success(
            GM_Menu.getShowTextValue("baidu_tieba_optimize_image_preview")
          );
          tiebaOhterFunc.optimizeImagePreview();
        }
      }
      if (
        this.url.match(
          /^http(s|):\/\/(tieba.baidu|www.tieba).com\/mo\/q\/newtopic\/topicTemplate/g
        )
      ) {
        GM_Menu.add({
          key: "baidu_tieba_topic_redirect_jump",
          text: "重定向跳转",
          enable: true,
        });
        if (GM_Menu.get("baidu_tieba_topic_redirect_jump")) {
          log.success(
            GM_Menu.getShowTextValue("baidu_tieba_topic_redirect_jump")
          );
          tiebaOhterFunc.redirectJump();
        }
      }
      if (
        this.url.match(/^http(s|):\/\/(tieba.baidu|www.tieba).com\/f\?kw=/g)
      ) {
        /* 吧内 */
        tiebaBaNei.rememberPostSort();
      } else {
        /* 贴内 */
        tiebaBusiness.addScrollTopButton();
        tiebaBusiness.addAuthorClickEvent();
      }
      if (GM_Menu.get("baidu_tieba_add_search")) {
        log.success(GM_Menu.getShowTextValue("baidu_tieba_add_search"));
        tiebaSearchConfig.run();
      }
      /* tiebaBusiness.run(); */
      DOMUtils.ready(function () {
        utils
          .waitAnyNode(".tb-mobile-viewport", ".main-page-wrap")
          .then(async () => {
            let interval = setInterval(() => {
              tiebaInfo.forumName = tiebaBusiness.getCurrentForumName();
              if (tiebaInfo.forumName) {
                log.info("当前吧：" + tiebaInfo.forumName);
                clearInterval(interval);
              }
            }, 250);
          });
      });
    },
    /**
     * 百度文库
     */
    wenku() {
      if (!this.url.match(/^http(s|):\/\/(wk|tanbi).baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.wenku);
      log.info("插入CSS规则");
      GM_Menu.add([
        {
          key: "baidu_wenku_block_member_picks",
          text: "【屏蔽】会员精选",
          enable: true,
        },
        {
          key: "baidu_wenku_blocking_app_featured",
          text: "【屏蔽】APP精选",
          enable: true,
        },
        {
          key: "baidu_wenku_blocking_related_documents",
          text: "【屏蔽】相关文档",
        },
        {
          key: "baidu_wenku_blocking_bottom_toolbar",
          text: "【屏蔽】底部工具栏",
        },
        {
          key: "baidu_wenku_shield_next_btn",
          text: "【屏蔽】下一篇按钮",
        },
      ]);
      /* 屏蔽会员精选 */
      if (GM_Menu.get("baidu_wenku_block_member_picks")) {
        log.success(GM_Menu.getShowTextValue("baidu_wenku_block_member_picks"));
        GM_addStyle(`
          div[class*="vip-choice_"][data-ait-action="vipChoiceShow"]{
            display: none !important;
          }`);
      }
      /* 屏蔽APP精选 */
      if (GM_Menu.get("baidu_wenku_blocking_app_featured")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_wenku_blocking_app_featured")
        );
        GM_addStyle(`
          div[class*="app-choice_"][data-ait-action="appChoiceNewShow"],
          div.folder-wrap.invite-clipboard[data-clipboard-text]{
            display: none !important;
          }`);
      }
      /* 屏蔽相关文档 */
      if (GM_Menu.get("baidu_wenku_blocking_related_documents")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_wenku_blocking_related_documents")
        );
        GM_addStyle(`
          div.fold-page-conversion,
          div.newrecom-list.invite-clipboard[data-clipboard-text]{
            display: none !important;
          }`);
      }
      /* 屏蔽底部工具栏 */
      if (GM_Menu.get("baidu_wenku_blocking_bottom_toolbar")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_wenku_blocking_bottom_toolbar")
        );
        GM_addStyle(`
          div.barbottom{
            display: none !important;
          }`);
      }
      /* 屏蔽下一篇按钮 */
      if (GM_Menu.get("baidu_wenku_shield_next_btn")) {
        log.success(GM_Menu.getShowTextValue("baidu_wenku_shield_next_btn"));
        GM_addStyle(`
          div.next-page-container{
            display: none !important;
          }`);
      }
    },
    /**
     * 百度经验
     */
    jingyan() {
      if (!this.url.match(/^http(s|):\/\/jingyan.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.jingyan);
      log.info("插入CSS规则");
    },
    /**
     * 百度百科
     */
    baike() {
      if (!this.url.match(/^http(s|):\/\/(baike|wapbaike).baidu.com/g)) {
        return;
      }
      let page = 1;
      GM_addStyle(this.css.baike);
      log.info("插入CSS规则");
      GM_Menu.add({
        key: "baidu_baike_sync_next_page_address",
        text: "同步下一页地址",
      });

      /**
       * 获取到的图片大小要重新设置
       */
      function setImageWidthHeight() {
        document.querySelectorAll(".col-para").forEach((item) => {
          item.setAttribute("style", "width: 42.936vw;margin: 0 auto;");
          let content_img_item = item.querySelector(".content-img-item");
          let content_img_link = item.querySelector(".content-img-link");
          let content_album = item.querySelector(".content-album");
          content_album?.setAttribute("style", "");
          if (content_album) {
            content_img_item = item.querySelector(".content-album-item");
            content_img_link = item.querySelector(".content-album-link");
          }
          content_img_item?.setAttribute(
            "style",
            "max-height: 39vw;max-width: 30vw;border-radius: 0.09rem;margin: 0 auto;overflow: hidden;"
          );
          content_img_link?.setAttribute("style", "width: 30vw;");
        });
      }

      /**
       * 获取到的要重新将图片链接插入到img标签中
       */
      function insertUrlToImageNode() {
        document.querySelectorAll(".lazy-img").forEach((item) => {
          let content_img = item.parentElement.parentElement.parentElement;
          let img_url = content_img.getAttribute("data-src")
            ? content_img.getAttribute("data-src")
            : item.getAttribute("data-url");
          if (img_url != null) {
            item.innerHTML = `<img src="${img_url}"></img>`;
          }
        });
      }
      /**
       * 循环加载更多内容
       */
      function loadMore() {
        utils
          .waitNodeList(".BK-main-content", "#J-gotoPC-top")
          .then(async () => {
            let nextPageNode = document.querySelector("#J-gotoPC-top");
            let nextPageUrl = nextPageNode.href;
            let nextUrlObj = new URL(nextPageUrl);
            let itemId = nextUrlObj.pathname.match(
              new RegExp("/item/.+?/([0-9]+)", "i")
            );
            if (!itemId) {
              log.error(nextPageUrl);
              log.error("匹配id失败");
              return;
            }
            log.success(`获取下一页地址: ${nextPageUrl}`);
            loadingView.initLoadingView();
            log.success(document.querySelector(".BK-main-content"));
            DOMUtils.after(
              document.querySelector(".BK-main-content"),
              loadingView.getLoadingViewElement()
            );
            while (1) {
              loadingView.show();
              let nextPageUrl = `https://baike.baidu.com${
                nextUrlObj.pathname
              }?wpf=3&ldr=1&page=${page}&insf=1&_=${new Date().getTime()}`;
              log.info(nextPageUrl);
              let getResp = await httpx.get({
                url: nextPageUrl,
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/112.0.0.0",
                },
              });
              let respData = getResp.data;
              if (getResp.status) {
                let respObj = DOMUtils.parseHTML(
                  respData.responseText,
                  true,
                  true
                );
                let main_content = respObj.querySelector(".BK-main-content");
                nextPageContent = main_content.innerHTML;
                if (main_content.children.length <= 2) {
                  log.info("已到达最大页" + (page - 1));
                  insertUrlToImageNode();
                  setImageWidthHeight();
                  loadingView.setText("已到达最大页" + (page - 1));
                  break;
                } else {
                  loadingView.setText("正在加载页 " + page, true);
                  log.info(nextPageContent);
                  DOMUtils.append(
                    document.querySelector(".BK-main-content"),
                    nextPageContent
                  );
                  // 等待350ms，防止被百度识别为机器人
                  await utils.sleep(350);
                }
                if (GM_Menu.get("baidu_baike_sync_next_page_address")) {
                  window.history.pushState("forward", null, respData.finalUrll);
                }
                page++;
              } else if (getResp.type === "onerror") {
                log.error("请求失败 👇");
                log.error(respData);
                insertUrlToImageNode();
                setImageWidthHeight();
                loadingView.setText("请求失败");
                loadingView.hideIcon();
                break;
              } else if (getResp.type === "ontimeout") {
                log.error("请求超时 👇");
                insertUrlToImageNode();
                setImageWidthHeight();
                loadingView.setText("请求超时");
                loadingView.hideIcon();
                break;
              } else {
                log.error("未知错误");
                insertUrlToImageNode();
                setImageWidthHeight();
                loadingView.setText("未知错误");
                loadingView.hideIcon();
                break;
              }
            }
          });
      }
      loadMore();
    },
    /**
     * 百度百科-他说
     */
    baiketashuo() {
      if (!this.url.match(/^http(s|):\/\/baike.baidu.com\/tashuo/g)) {
        return;
      }
      /**
       * 去除底部广告
       */
      function remove_bottom_ad() {
        utils.waitNode("#index_tashuo_list").then(() => {
          utils.mutationObserver(document.querySelector("#index_tashuo_list"), {
            callback: (mutations, observer) => {
              Array.from(
                document.querySelector("#index_tashuo_list").children
              ).forEach((item) => {
                if (item.className !== "J-hot-item-container") {
                  log.info(["存在广告-删除！", item]);
                  item.remove();
                }
              });
            },
            config: { subtree: true, childList: true, attributes: true },
          });
        });
      }
      remove_bottom_ad();
    },
    /**
     * 百度知道
     */
    zhidao() {
      if (!this.url.match(/^http(s|):\/\/zhidao.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.zhidao);
      log.info("插入CSS规则");
      if (document.querySelector(".ec-ad")) {
        DOMUtils.remove(DOMUtils.parent(document.querySelectorAll(".ec-ad")));
      }
      GM_Menu.add([
        {
          key: "baidu_zhidao_block_recommend_more_exciting_content",
          text: "【屏蔽】推荐更多精彩内容",
          enable: true,
        },
        {
          key: "baidu_zhidao_block_related_issues",
          text: "【屏蔽】相关问题",
          enable: true,
        },
        {
          key: "baidu_zhidao_block_other_answers",
          text: "【屏蔽】其他回答",
          enable: true,
        },
        {
          key: "baidu_fanyi_auto_focus",
          text: "自动点击-展开更多回答",
          enable: true,
        },
      ]);
      if (GM_Menu.get("baidu_zhidao_block_recommend_more_exciting_content")) {
        log.success(
          GM_Menu.getShowTextValue(
            "baidu_zhidao_block_recommend_more_exciting_content"
          )
        );
        GM_addStyle(`
          .feed-recommend-title,
          #feed-recommend,
          .mm-content-box.mm-content-line.feed-recommend{
            display: none !important;
          }`);
      }
      if (GM_Menu.get("baidu_zhidao_block_other_answers")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_zhidao_block_other_answers")
        );
        GM_addStyle(`
          .replies-container + div{
            display: none !important;
          }`);
      }
      if (GM_Menu.get("baidu_zhidao_block_related_issues")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_zhidao_block_related_issues")
        );
        GM_addStyle(`
          div[id^=wahsd],
          div[class^="w-question-list"]{
            display: none !important;
          }`);
      }
    },
    /**
     * 百度翻译
     */
    fanyi() {
      if (!this.url.match(/^http(s|):\/\/fanyi.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.fanyi);
      log.info("插入CSS规则");
      GM_Menu.add([
        {
          key: "baidu_fanyi_recommended_shielding_bottom",
          text: "【屏蔽】底部推荐",
          enable: true,
        },
        {
          key: "baidu_fanyi_other_shielding_bottom",
          text: "【屏蔽】底部其它",
          enable: true,
        },
        {
          key: "baidu_fanyi_auto_focus",
          text: "自动聚焦输入框",
          enable: true,
        },
      ]);
      if (GM_Menu.get("baidu_fanyi_recommended_shielding_bottom")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_fanyi_recommended_shielding_bottom")
        );
        GM_addStyle(`
        section.article.android-style{
          display: none !important;
        }`);
      }
      if (GM_Menu.get("baidu_fanyi_other_shielding_bottom")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_fanyi_other_shielding_bottom")
        );
        GM_addStyle(`
        .trans-other-wrap.clearfix{
          display: none !important;
        }`);
      }
      if (GM_Menu.get("baidu_fanyi_auto_focus")) {
        log.success(GM_Menu.getShowTextValue("baidu_fanyi_auto_focus"));
        utils.waitNode("textarea#j-textarea").then(() => {
          setTimeout(() => {
            document.querySelector("textarea#j-textarea").focus();
          }, 2500);
        });
      }
    },
    /**
     * 百度翻译-APP
     */
    fanyiApp() {
      if (!this.url.match(/^http(s|):\/\/fanyi-app.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.fanyiApp);
      utils.waitNode("#page-content").then((element) => {
        element.setAttribute("style", "max-height:unset !important");
      });
      log.info("插入CSS规则");
      GM_Menu.add([
        {
          key: "baidu_fanyi_app_shield_column_information",
          text: "【屏蔽】专栏信息",
          enable: false,
        },
        {
          key: "baidu_fanyi_app_shield_recommended_for_you",
          text: "【屏蔽】为你推荐",
          enable: false,
        },
        {
          key: "baidu_fanyi_app_shield_i_need_to_follow_along",
          text: "【屏蔽】我要跟读",
          enable: false,
        },
      ]);
      if (GM_Menu.get("baidu_fanyi_app_shield_column_information")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_fanyi_app_shield_column_information")
        );
        GM_addStyle(`
        div.fanyi-zhuan-lan-wrapper{
          display: none !important;
        }
        `);
      }
      if (GM_Menu.get("baidu_fanyi_app_shield_recommended_for_you")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_fanyi_app_shield_recommended_for_you")
        );
        GM_addStyle(`
        #fr-section{
          display: none !important;
        }
        `);
      }
      if (GM_Menu.get("baidu_fanyi_app_shield_i_need_to_follow_along")) {
        log.success(
          GM_Menu.getShowTextValue(
            "baidu_fanyi_app_shield_i_need_to_follow_along"
          )
        );
        GM_addStyle(`
        .cover-all .daily-bottom{
          display: none !important;
        }
        `);
      }
    },
    /**
     * 百度图片
     */
    image() {
      if (!this.url.match(/^http(s|):\/\/image.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.image);
      log.info("插入CSS规则");
    },
    /**
     * 百度地图
     */
    map() {
      if (!this.url.match(/^http(s|):\/\/map.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.map);
      log.info("插入CSS规则");

      GM_Menu.add({
        key: "baidu_map_hijack_wakeup",
        text: "劫持唤醒",
        enable: false,
      });

      if (GM_Menu.get("baidu_map_hijack_wakeup")) {
        log.success(GM_Menu.getShowTextValue("baidu_map_hijack_wakeup"));
        baiduHijack.hijackElementAppendChild();
        DOMUtils.ready(function () {
          baiduHijack.hijackJQueryAppend();
        });
        baiduHijack.hijackSetTimeout(
          /goToDownloadOfAndrod|downloadAndrFromMarket|jumpToDownloadPage|jumpToMiddlePage|downloadIosPkg/
        );
      }
    },
    /**
     * 百度知道
     */
    mbd() {
      if (!this.url.match(/^http(s|):\/\/mbd.baidu.com/g)) {
        return;
      }
      /* 
        示例
        https://mbd.baidu.com/newspage/data/landingsuper?isBdboxFrom=1&pageType=1&context=%7B%22nid%22%3A%22news_8924612668430208297%22,%22sourceFrom%22%3A%22bjh%22%7D
        */
      GM_Menu.add([
        {
          key: "baidu_mbd_block_exciting_comments",
          text: "【屏蔽】精彩评论",
        },
        {
          key: "baidu_mbd_block_exciting_recommendations",
          text: "【屏蔽】精彩推荐",
        },
        {
          key: "baidu_mbd_shield_bottom_toolbar",
          text: "【屏蔽】底部工具栏",
        },
        {
          key: "baidu_mbd_hijack_wakeup",
          text: "劫持唤醒",
          enable: false,
        },
        {
          key: "baidu_mbd_hijack_BoxJSBefore",
          text: "劫持BoxJSBefore",
          enable: false,
        },
        {
          key: "baidu_mbd_hijack_iframe",
          text: "劫持iframe",
          enable: true,
        },
      ]);
      GM_addStyle(this.css.mbd);
      log.info("插入CSS规则");
      if (GM_Menu.get("baidu_mbd_block_exciting_comments")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_mbd_block_exciting_comments")
        );
        GM_addStyle(`
        div#commentModule,
        #comment{
          display: none !important;
        }
        `);
      }
      if (GM_Menu.get("baidu_mbd_block_exciting_recommendations")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_mbd_block_exciting_recommendations")
        );
        GM_addStyle(`
        div[class^="relateTitle"],
        .infinite-scroll-component__outerdiv,
        div#fuseVideo + div[class],
        /* 精彩推荐的文字 */
        #content_wrapper + div + div,
        /* 简单UA下精彩推荐的文字 */
        #page_wrapper .searchCraft #content_wrapper + div{
          display: none !important;
        }
        `);
        GM_addStyle(`
        /* Gecko下的简单UA下精彩推荐 */
        #page_wrapper > div > div:nth-child(6){
          display: none !important;
        }
        `);
      }
      if (GM_Menu.get("baidu_mbd_shield_bottom_toolbar")) {
        log.success(GM_Menu.getText("baidu_mbd_shield_bottom_toolbar"));
        GM_addStyle(`
        div#wise-invoke-interact-bar{
          display: none !important;
        }
        `);
      }
      if (GM_Menu.get("baidu_mbd_hijack_wakeup")) {
        log.success(GM_Menu.getShowTextValue("baidu_mbd_hijack_wakeup"));
        baiduHijack.hijackFunctionCall_BaiJiaHao_Map();
      }
      if (GM_Menu.get("baidu_mbd_hijack_BoxJSBefore")) {
        log.success(GM_Menu.getShowTextValue("baidu_mbd_hijack_BoxJSBefore"));
        baiduHijack.hijackBoxJSBefore();
      }
      if (GM_Menu.get("baidu_mbd_hijack_iframe")) {
        log.success(GM_Menu.getShowTextValue("baidu_mbd_hijack_iframe"));
        /* 劫持iframe添加到页面 */
        baiduHijack.hijackElementAppendChild();
      }
    },
    /**
     * 百度知了好学
     */
    xue() {
      if (!this.url.match(/^http(s|):\/\/xue.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.xue);
      log.info("插入CSS规则");
    },
    /**
     * 百度-爱企查
     */
    aiqicha() {
      if (!this.url.match(/^http(s|):\/\/aiqicha.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.aiqicha);
      log.info("插入CSS规则");
      unsafeWindow.localStorage.setItem(
        "coupon_bottom_popup",
        new Date().getTime()
      );
      GM_Menu.add([
        {
          key: "baidu_aiqicha_shield_carousel",
          text: "【屏蔽】轮播图",
          enable: true,
        },
        {
          key: "baidu_aiqicha_shield_industry_host_news",
          text: "【屏蔽】行业热点新闻",
          enable: true,
        },
      ]);
      /**
       * 屏蔽轮播图
       */
      if (GM_Menu.get("baidu_aiqicha_shield_carousel")) {
        log.success(GM_Menu.getShowTextValue("baidu_aiqicha_shield_carousel"));
        GM_addStyle(`
        div.index-banner-container.van-swipe{
          display: none !important;
        }`);
      }
      /**
       * 屏蔽行业热点新闻
       */
      if (GM_Menu.get("baidu_aiqicha_shield_industry_host_news")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_aiqicha_shield_industry_host_news")
        );
        GM_addStyle(`
        div.hot-news{
          display: none !important;
        }`);
      }
    },
    /**
     * 百度网盟推广
     */
    pos() {
      if (!this.url.match(/^http(s|):\/\/pos.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.pos);
      log.info("插入CSS规则");
    },
    /**
     * 百度好看视频
     */
    haokan() {
      if (!this.url.match(/^http(s|):\/\/haokan.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.haokan);
      log.info("插入CSS规则");
      GM_Menu.add([
        {
          key: "baidu_haokan_shield_may_also_like",
          text: "【屏蔽】猜你喜欢",
          enable: true,
        },
        {
          key: "baidu_haokan_shield_today_s_hot_list",
          text: "【屏蔽】今日热播榜单",
          enable: true,
        },
        {
          key: "baidu_haokan_shield_right_video_action",
          text: "【屏蔽】右侧工具栏",
          enable: true,
        },
        {
          key: "baidu_haokan_play_video_and_automatically_enter_full_screen",
          text: "播放视频自动进入全屏",
          enable: false,
        },
        {
          key: "baidu_haokan_hijack_wakeup",
          text: "劫持唤醒",
          enable: false,
        },
      ]);
      if (GM_Menu.get("baidu_haokan_shield_may_also_like")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_haokan_shield_may_also_like")
        );
        GM_addStyle(`
        div.top-video-list-container{display: none !important};
        `);
      }
      if (GM_Menu.get("baidu_haokan_shield_today_s_hot_list")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_haokan_shield_today_s_hot_list")
        );
        GM_addStyle(`
        .hot-rank-video{
          display: none !important;
        }
        `);
      }
      if (GM_Menu.get("baidu_haokan_shield_right_video_action")) {
        log.success(
          GM_Menu.getShowTextValue("baidu_haokan_shield_right_video_action")
        );
        GM_addStyle(`
        .video-author-info-mask .new-video-action{
          display: none !important;
        }
        `);
      }
      if (GM_Menu.get("baidu_haokan_hijack_wakeup")) {
        log.success(GM_Menu.getShowTextValue("baidu_haokan_hijack_wakeup"));
        baiduHijack.hijackFunctionCall_WebPack_HaoKan();
      }

      DOMUtils.ready(function () {
        let playBtn = document.querySelector(".play-btn");
        DOMUtils.on(playBtn, "click", function () {
          let currentPageSee = document.querySelector(
            ".video-player .video-player-pause-btns .continue"
          );
          setTimeout(() => {
            utils
              .getReactObj(currentPageSee)
              ["reactEventHandlers"]["onClick"]();

            if (
              GM_Menu.get(
                "baidu_haokan_play_video_and_automatically_enter_full_screen"
              )
            ) {
              log.success(
                GM_Menu.getShowTextValue(
                  "baidu_haokan_play_video_and_automatically_enter_full_screen"
                )
              );
              if (utils.isFullscreenEnabled()) {
                let videoElement = document.querySelector(
                  "#video video.hplayer-video"
                );
                utils.enterFullscreen(videoElement);
              }
            }
          }, 0);
        });
      });
    },
    /**
     * 百度识图
     */
    graph() {
      if (!this.url.match(/^http(s|):\/\/graph.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.graph);
      log.info("插入CSS规则");
      /**
       * 上传图片
       * @async
       * @param {Event} event
       * @returns
       */
      async function uploadImage(event) {
        let uploadImageFile = event.target.files[0];
        if (!uploadImageFile) {
          alert("似乎并未正确上传图片？");
          return;
        }
        let formData = new FormData();
        formData.append("image", uploadImageFile);
        formData.append("tn", "pc");
        formData.append("from", "pc");
        formData.append("image_source", "PC_UPLOAD_FILE");
        formData.append("sdkParams", "undefined");
        let postResp = await httpx.post({
          url: `https://graph.baidu.com/upload?uptime=${Date.now()}`,
          data: formData,
          resposeType: "json",
          headers: {
            "user-agent": utils.getRandomPCUA(),
            Origin: "https://graph.baidu.com",
            Referer: "https://graph.baidu.com/pcpage/index?tpl_from=pc",
            Accept: "*/*",
          },
        });
        event.target.value = "";
        log.success(postResp);
        if (!postResp.status || postResp.data.status !== 200) {
          alert("图片上传失败，详情请看控制台");
          return;
        }
        let imageJSONData = utils.toJSON(postResp.data.responseText);
        log.success(imageJSONData);
        if (imageJSONData["status"] !== 0) {
          alert("图片API返回信息中status不为0，详情请看控制台");
        }
        if (window.location.pathname === "/s") {
          window.location.href = imageJSONData["data"]["url"];
        } else {
          window.open(imageJSONData["data"]["url"], "_blank");
        }
      }
      /* 重构主页的识图一下 */
      utils
        .waitNode(
          "#app section.vf-home-booth div.vf-w-button.vf-home-booth-camera"
        )
        .then((element) => {
          log.success("重构主页的识图一下");
          let uploadImageDivDOM = DOMUtils.createElement("div", {
            class: "vf-home-booth-camera",
          });
          DOMUtils.css(uploadImageDivDOM, {
            position: "absolute",
            bottom: "-.42rem",
            left: "50%",
            width: "2.2rem",
            height: ".74rem",
            "background-image":
              "url(https://imgn0.bdstatic.com/image/mobile/n/static/wiseik/static/img/camera_5e72a3a.png)",
            "background-repeat": "no-repeat",
            "background-size": "cover",
            "background-position": "top",
            "-webkit-transform": "translateX(-50%)",
            "-ms-transform": "translateX(-50%)",
            transform: "translateX(-50%)",
            "-webkit-tap-highlight-color": "transparent",
          });
          DOMUtils.on(uploadImageDivDOM, "click", function () {
            document.querySelector("input#whitesev-upload-image").click();
          });

          DOMUtils.after(element, uploadImageDivDOM);
        });
      /* 重构主页的往下滑动右下角出现的搜索图标按钮 */
      utils.waitNode(".vf-home.view-page").then((element) => {
        log.success("重构主页的往下滑动右下角出现的搜索图标按钮");
        let divHomeCamera = DOMUtils.createElement("div", {
          class: "whitesev-vf-home-camera",
        });
        DOMUtils.css(divHomeCamera, {
          display: "none",
          position: "fixed",
          right: ".1rem",
          bottom: ".48rem",
          height: ".74rem",
          width: ".74rem",
          "border-radius": "3px",
          background:
            "url(https://imgn0.bdstatic.com/image/mobile/n/static/wiseik/static/img/cameraBtn_c19ac1e.png) no-repeat 50%/100% auto",
          "text-align": "center",
        });
        DOMUtils.on(divHomeCamera, "click", function () {
          document.querySelector("input#whitesev-upload-image").click();
        });
        DOMUtils.append(element, divHomeCamera);
        utils.watchObject(
          element.__vue__,
          "showBottomCamera",
          () => {
            return false;
          },
          (_value_) => {
            if (_value_) {
              DOMUtils.show(divHomeCamera);
            } else {
              DOMUtils.hide(divHomeCamera);
            }
          }
        );
      });
      /* 如果出现识图没结果，重新识别，可能是因为后面参数多了tpl_from=pc的问题 */
      utils.waitNode("#app .graph-noresult-text1").then(() => {
        if (window.location.search.endsWith("&tpl_from=pc")) {
          window.location.href = window.location.href.replace(
            /&tpl_from=pc$/gi,
            ""
          );
        }
      });
      /* 在已搜索出相关结果的界面中的重构【重拍】按钮 */
      utils.waitNode("#viewport .graph-imagecut-banner-ctn").then((element) => {
        let retakeDivDOM = DOMUtils.createElement("div", {
          class: "retake-image",
          textContent: "重拍",
        });
        DOMUtils.css(retakeDivDOM, {
          position: "absolute",
          top: "50%",
          right: "0",
          padding: "0 .17rem",
          "font-size": "16px",
          "line-height": "60px",
          color: "#000",
          "-webkit-transform": "translateY(-50%)",
          transform: "translateY(-50%)",
        });
        DOMUtils.on(retakeDivDOM, "click", function (event) {
          utils.preventEvent(event);
          document.querySelector("input#whitesev-upload-image").click();
          DOMUtils.trigger(
            document.querySelector("input#whitesev-upload-image"),
            "click"
          );
        });
        setTimeout(() => {
          DOMUtils.append(element, retakeDivDOM);
        }, 2000);
      });
      DOMUtils.ready(function () {
        let uploadImageInput = DOMUtils.createElement("input", {
          id: "whitesev-upload-image",
          type: "file",
          accept: "image/*",
          style: "display: none",
        });
        DOMUtils.on(uploadImageInput, "change", uploadImage);
        DOMUtils.append(document.body, uploadImageInput);
      });
    },
    /**
     * 百度网盘
     */
    pan() {
      if (!this.url.match(/^http(s|):\/\/pan.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.pan);
      log.info("插入CSS规则");
    },
    /**
     * 文心一言
     */
    yiyan() {
      if (!this.url.match(/^http(s|):\/\/yiyan.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.yiyan);
      log.info("插入CSS规则");
      GM_Menu.add({
        key: "baidu_yiyan_remove_ai_mask",
        text: "【屏蔽】水印",
      });

      const webSiteHandle = {
        /**
         * 通过处理attachShadow和appendChild原型来去除水印
         * 屏蔽 AI生成内容仅供参考
         * 屏蔽 AI作图
         */
        blockWaterMark() {
          let oldShadow = Element.prototype.attachShadow;
          Element.prototype.attachShadow = function () {
            const shadowRoot = oldShadow.call(this, arguments);
            this._shadowRoot = shadowRoot;
            shadowRoot.appendChild(
              DOMUtils.createElement(
                "style",
                "div[id^='mask']{display: none !important;}"
              )
            );
            return shadowRoot;
          };
          let oldAppendChild = Element.prototype.appendChild;
          Element.prototype.appendChild = function (element) {
            if (element.localName === "img") {
              setTimeout(() => {
                Array.from(document.querySelectorAll("img")).forEach(
                  (imageElement) => {
                    if (imageElement.src.endsWith("style/wm_ai")) {
                      imageElement.src = imageElement.src.replace(
                        /style\/wm_ai$/gi,
                        ""
                      );
                    }
                  }
                );
              }, 150);
            }

            return oldAppendChild.call(this, element);
          };
        },
      };

      if (GM_Menu.get("baidu_yiyan_remove_ai_mask")) {
        log.success(GM_Menu.getShowTextValue("baidu_yiyan_remove_ai_mask"));
        webSiteHandle.blockWaterMark();
      }
    },
    /**
     * AI对话
     */
    chat() {
      if (!this.url.match(/^http(s|):\/\/chat.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.chat);
      log.info("插入CSS规则");
      GM_Menu.add({
        key: "baidu_chat_remove_ai_mask",
        text: "【屏蔽】水印",
        enable: true,
      });

      if (GM_Menu.get("baidu_chat_remove_ai_mask")) {
        log.success(GM_Menu.getShowTextValue("baidu_chat_remove_ai_mask"));
        GM_addStyle(`
        .bot-body .watermark,
        #searchChatApp div[class^="watermark"]{
          background-image: none !important;
        }`);
        let maskMutationObserver = new utils.LockFunction(function () {
          document
            .querySelectorAll("img[src*='style/wm_ai']")
            .forEach((imgElement) => {
              log.info("处理AI水印：" + imgElement.src);
              imgElement.src = imgElement.src.replace(/style\/wm_ai/g, "");
            });
        }, 400);
        utils.mutationObserver(document.body, {
          config: { subtree: true, childList: true },
          callback: maskMutationObserver.run,
        });
      }
    },
    /**
     * 百度小程序-百度教育
     */
    mini_jiaoyu() {
      if (!this.url.match(/^http(s|):\/\/uf9kyh.smartapps.cn/g)) {
        return;
      }
      GM_addStyle(this.css.mini_jiaoyu);
      log.info("插入CSS规则");
      GM_Menu.add({
        key: "mini_baidu_jiaoyu_shield_bottom_pull_down_menu",
        text: "【屏蔽】底部下拉菜单",
        enable: false,
      });

      if (GM_Menu.get("mini_baidu_jiaoyu_shield_bottom_pull_down_menu")) {
        log.success(
          GM_Menu.getShowTextValue(
            "mini_baidu_jiaoyu_shield_bottom_pull_down_menu"
          )
        );
        let hideCSS = `
        #page_loft{
          display: none !important;
        }
        `;
        GM_addStyle(hideCSS);
        if (top === window) {
          DOMUtils.ready(function () {
            utils.waitNode("iframe.swan-web-iframe").then((iframeElement) => {
              let _document = iframeElement.contentDocument;
              let _window = iframeElement.contentWindow;
              function callback() {
                _document.head.appendChild(
                  DOMUtils.createElement("style", {
                    type: "text/css",
                    innerHTML: hideCSS,
                  })
                );
              }
              function completed() {
                _document.removeEventListener("DOMContentLoaded", completed);
                _window.removeEventListener("load", completed);
                callback();
              }
              if (
                _document.readyState === "complete" ||
                (_document.readyState !== "loading" &&
                  !_document.documentElement.doScroll)
              ) {
                _window.setTimeout(callback);
              } else {
                /* 监听DOMContentLoaded事件 */
                _document.addEventListener("DOMContentLoaded", completed);
                /* 监听load事件 */
                _window.addEventListener("load", completed);
              }
            });
          });
        }
      }
    },
    /**
     * 百度教育
     */
    easyLearn() {
      if (!this.url.match(/^http(s|):\/\/easylearn.baidu.com/g)) {
        return;
      }
      GM_addStyle(this.css.easyLearn);
      log.info("插入CSS规则");
      let menuBusiness = [
        {
          key: "baidu_easylearn_shield_this_question_paper",
          text: "【屏蔽】本题试卷",
          _callback_() {
            GM_addStyle(`
            .question-shijuan-wrap,
            /* PC端 */
            .question-cont .timu-wrap .doc-cont-v2 .left{
              display: none !important;
            }
            `);
          },
        },
        {
          key: "baidu_easylearn_shield_good_questions_in_this_volume",
          text: "【屏蔽】本卷好题",
          _callback_() {
            GM_addStyle(`
            .exercise-questions-wrap{
              display: none !important;
            }
            `);
          },
        },
        {
          key: "baidu_easylearn_shield_related_test_papers",
          text: "【屏蔽】相关试卷",
          _callback_() {
            GM_addStyle(`
            .related-papers-wrap,
            /* PC端 */
            .question-cont .timu-wrap .doc-cont-v2 .right{
              display: none !important;
            }{
              display: none !important;
            }
            `);
          },
        },
        {
          key: "baidu_easylearn_shield_video_explanation",
          text: "【屏蔽】视频讲解",
          _callback_() {
            GM_addStyle(`
            .video-doc-compo,
            /* PC端 */
            .container #questionVideo{
              display: none !important;
            }
            `);
          },
        },
        {
          key: "baidu_easylearn_shield_xueba_notes",
          text: "【屏蔽】学霸笔记",
          _callback_() {
            GM_addStyle(`
            .note-list{
              display: none !important;
            }
            `);
          },
        },
        {
          key: "baidu_easylearn_shield_bottom_toolbar",
          text: "【屏蔽】底部工具栏",
          _callback_() {
            GM_addStyle(`
            .question-bottom-bar{
              display: none !important;
            }
            `);
          },
        },
      ];
      menuBusiness.forEach((item) => {
        let callback = item["_callback_"];
        delete item["_callback_"];
        GM_Menu.add(item);
        if (!GM_Menu.get(item.key)) {
          return;
        }
        log.success(GM_Menu.getShowTextValue(item.key));
        callback();
      });
      DOMUtils.ready(function () {
        utils
          .waitNodeWithInterval(
            ".search-input .search-box-wrap.search-box",
            10000
          )
          .then(async () => {
            await utils.waitPropertyByInterval(
              () => {
                return document.querySelector(
                  ".search-input .search-box-wrap.search-box"
                );
              },
              (inputElement) => {
                return inputElement?.__vue__?.isFake != null;
              },
              250,
              10000
            );
            document.querySelector(
              ".search-input .search-box-wrap.search-box"
            ).__vue__.isFake = false;
            log.success("允许使用顶部搜索输入框");
          });
      });
    },
  };

  /**
   * 百度劫持
   */
  const baiduHijack = {
    /**
     * 劫持剪贴板写入
     * + 百度搜索(m.baidu.com|www.baidu.com)
     *
     * Function.prototype.apply
     */
    hijackCopy() {
      let originApply = Function.prototype.apply;
      Function.prototype.apply = function () {
        try {
          let _Arguments = arguments[1];
          if (
            arguments.length === 2 &&
            typeof _Arguments === "object" &&
            "" + _Arguments === "[object Arguments]" &&
            _Arguments.length === 1 &&
            typeof _Arguments[0] === "object" &&
            _Arguments[0] != null &&
            "appName" in _Arguments[0] &&
            "checkTokenCopied" in _Arguments[0] &&
            "deeplink" in _Arguments[0] &&
            "scheme" in _Arguments[0] &&
            "token" in _Arguments[0] &&
            "useDeeplink" in _Arguments[0]
          ) {
            log.success(["劫持复制到剪贴板", ..._Arguments]);
            return new Promise(function (resolve) {
              log.success(["修改参数并劫持复制到剪贴板返回true"]);
              resolve({
                status: true,
              });
            });
          }
        } catch (error) {
          log.error(error);
        }
        return originApply.call(this, ...arguments);
      };
    },
    /**
     * 劫持apply的Scheme调用
     * + 百度搜索(m.baidu.com|www.baidu.com)
     *
     * Function.prototype.apply
     */
    hijackFunctionApplyScheme() {
      let originApply = Function.prototype.apply;
      Function.prototype.apply = function () {
        try {
          let _Arguments = arguments[1];
          if (
            arguments.length === 2 &&
            typeof _Arguments === "object" &&
            "" + _Arguments === "[object Arguments]" &&
            _Arguments.length === 2 &&
            _Arguments[1] === "scheme"
          ) {
            log.success(["劫持Scheme", ..._Arguments]);
            return;
          }
        } catch (error) {
          log.error(error);
        }
        return originApply.call(this, ...arguments);
      };
    },
    /**
     * 劫持添加元素，包括script标签、iframe标签，默认劫持iframe的非http链接
     * + 百度贴吧(tieba.baidu.com)
     * + 百度地图(map.baidu.com)
     * Element.prototype.appendChild
     * @param {(element:HTMLElement)=>{}|undefined} handleCallBack 处理的回调函数，如果劫持请返回true
     */
    hijackElementAppendChild(handleCallBack) {
      let originDocumentAppendChild = Element.prototype.appendChild;
      Element.prototype.appendChild = function (element) {
        if (element instanceof HTMLIFrameElement) {
          if (!element?.src?.startsWith("http")) {
            log.success(["劫持iframe唤醒：" + element.src, element]);
            return;
          }
        }
        if (typeof handleCallBack === "function") {
          let handleResult = handleCallBack(element);
          if (handleResult) {
            return;
          }
        }
        return originDocumentAppendChild.call(this, element);
      };
    },
    /**
     * 劫持jQuery的append的iframe
     * + 百度地图(map.baidu.com)
     *
     * $().append();
     */
    hijackJQueryAppend() {
      let originAppend = $.fn.append;
      $.fn.append = function (params) {
        if (typeof params === "string") {
          params = params.trim();
          if (
            params.startsWith('<iframe src="') &&
            !params.startsWith('<iframe src="http')
          ) {
            log.success(["劫持jQuery的iframe", params]);
            return;
          }
        }
        originAppend.apply(this, arguments);
      };
    },
    /**
     * 劫持OpenBox
     * + 百度搜索(m.baidu.com|www.baidu.com)
     *
     * window.OpenBox
     */
    hijackOpenBox() {
      let OpenBox = function () {
        return {
          open: function () {
            log.info(["劫持OpenBox-open传入参数👇", ...arguments]);
            if (!arguments.length) {
              return;
            }
            let invokeUrl =
              arguments[0]["invokeURL"] || arguments[0]["invoke_url"];
            if (
              typeof arguments[0] === "object" &&
              typeof invokeUrl === "string"
            ) {
              log.success("直接跳转Url：" + invokeUrl);
              window.location.href = invokeUrl;
            }
          },
          ready: function () {
            log.info(["劫持OpenBox-ready传入参数👇", ...arguments]);
          },
          version: 20170811,
        };
      };
      OpenBox.getIdmData = function () {
        return {};
      };
      Object.defineProperty(unsafeWindow, "OpenBox", {
        get: function () {
          return OpenBox;
        },
      });
    },

    /**
     * 劫持全局setTimeout
     * + 百度地图(map.baidu.com)
     *
     * window.setTimeout
     * @param {RegExp|string} [matchStr=""] 需要进行匹配的函数字符串
     */
    hijackSetTimeout(matchStr = "") {
      let originSetTimeout = unsafeWindow.setTimeout;
      unsafeWindow.setTimeout = function () {
        let callBackString = arguments[0].toString();
        if (callBackString.match(matchStr)) {
          log.success(["劫持延迟函数", callBackString]);
          return;
        }
        originSetTimeout.apply(this, arguments);
      };
    },
    /**
     * 劫持百度贴吧的window.webpackJsonp
     * 当前 "core:67"
     * + 百度贴吧(tieba.baidu.com)
     *
     * https://tb3.bdstatic.com/tb/wise/wise-main-core/static/js/collect~download~frs~gaokao~index~pb~userpost.0bd802e3.js
     * tiebaNewWakeup.js v3.0.3
     * (c) 2018-2023 liugui01
     * Released under the BaiDuTieBa License.
     */
    hijackFunctionCall_WebPack_TieBa() {
      this.hijackWebpack("webpackJsonp", ["core:0"], function (webpackExports) {
        if (
          typeof webpackExports?.exports === "object" &&
          typeof webpackExports.exports["getSchema"] === "function" &&
          typeof webpackExports.exports["getToken"] === "function" &&
          typeof webpackExports.exports["init"] === "function" &&
          typeof webpackExports.exports["initDiffer"] === "function"
        ) {
          log.success(["成功劫持webpack调用函数", webpackExports]);
          let codeId = webpackExports?.["i"];
          webpackExports.exports.getSchema = function () {
            log.info(["阻止调用getSchema", ...arguments]);
          };
          webpackExports.exports.getToken = function () {
            log.info(["阻止调用getToken", ...arguments]);
          };
          webpackExports.exports.init = function () {
            log.info(["阻止初始化", ...arguments]);
            if (arguments?.[0]?.["page"] === "usercenter") {
              /* 跳转至用户空间 */
              let homeUrl =
                "/home/main?id=" + arguments[0]["param"]["portrait"];
              log.info(["跳转至用户空间", homeUrl]);
              window.open(homeUrl);
            }
            return;
          };
          webpackExports.exports.initDiffer = function () {
            log.info(["阻止初始化差异", ...arguments]);
            return;
          };
          GM_Menu.update({
            key: "baidu_tieba_hijack_wake_up",
            text: "劫持唤醒",
            enable: false,
            showText(text, enable) {
              return `${
                enable
                  ? GM_Menu.getEnableTrueEmoji()
                  : GM_Menu.getEnableFalseEmoji()
              }${text} 🙏 成功劫持：${codeId}`;
            },
          });
        }
        return webpackExports;
      });
    },
    /**
     * 劫持webpack
     * @param {string} webpackName 当前全局变量的webpack名
     * @param {string|any[]} mainCoreData 需要劫持的webpack的顶部core，例如：(window.webpackJsonp = window.webpackJsonp || []).push([["core:0"],{}])
     * @param {(webpackExports: object|undefined)=>{}} checkCallBack 如果mainCoreData匹配上，则调用此回调函数
     */
    hijackWebpack(webpackName = "webpackJsonp", mainCoreData, checkCallBack) {
      let originObecjt = undefined;
      Object.defineProperty(unsafeWindow, webpackName, {
        get() {
          return originObecjt;
        },
        set(newValue) {
          log.success("成功劫持webpack，当前webpack名：" + webpackName);
          originObecjt = newValue;
          const originPush = originObecjt.push;
          originObecjt.push = function (...args) {
            let _mainCoreData = args[0][0];
            if (
              mainCoreData == _mainCoreData ||
              (Array.isArray(mainCoreData) &&
                Array.isArray(_mainCoreData) &&
                JSON.stringify(mainCoreData) === JSON.stringify(_mainCoreData))
            ) {
              Object.keys(args[0][1]).forEach((keyName) => {
                let originSwitchFunc = args[0][1][keyName];
                args[0][1][keyName] = function (..._args) {
                  let result = originSwitchFunc.call(this, ..._args);
                  _args[0] = checkCallBack(_args[0]);
                  return result;
                };
              });
            }
            return originPush.call(this, ...args);
          };
        },
      });
    },
    /**
     * 劫持百度好看视频的window.webpackJsonp
     * + 百度好看视频(haokan.baidu.com)
     *
     */
    hijackFunctionCall_WebPack_HaoKan() {
      this.hijackWebpack("webpackJsonp", [40, 1], function (webpackExports) {
        if (
          typeof webpackExports?.exports === "object" &&
          typeof webpackExports.exports["LaunchScheme"] === "function" &&
          typeof webpackExports.exports["__esModule"] === "boolean"
        ) {
          log.success(["成功劫持webpack调用函数", webpackExports]);
          let codeId = webpackExports?.["i"];
          webpackExports.exports["LaunchScheme"] = function () {
            log.success(["修改参数：LaunchScheme"]);
            return {
              launch() {
                return new Promise(function (resolve) {
                  log.success(["修改参数：launch"]);
                  resolve();
                });
              },
            };
          };
          GM_Menu.update({
            key: "baidu_haokan_hijack_wakeup",
            text: "劫持唤醒",
            enable: false,
            showText(text, enable) {
              return `${
                enable
                  ? GM_Menu.getEnableTrueEmoji()
                  : GM_Menu.getEnableFalseEmoji()
              }${text} 🙏 成功劫持：${codeId}`;
            },
          });
        }
        return webpackExports;
      });
    },
    /**
     * 劫持百家号和百度地图的Function的call
     * + 百家号(baijiahao.baidu.com)
     * + 百度地图(map.baidu.com)
     * Function.property.call
     */
    hijackFunctionCall_BaiJiaHao_Map() {
      let originCall = Function.prototype.call;
      Function.prototype.call = function () {
        if (
          arguments.length === 2 &&
          arguments[0] === undefined &&
          arguments[1] != null &&
          "arg" in arguments[1] &&
          "delegate" in arguments[1] &&
          "done" in arguments[1] &&
          "method" in arguments[1] &&
          "next" in arguments[1] &&
          "prev" in arguments[1]
        ) {
          log.success(["修改参数", arguments[1]]);
          arguments[1]["method"] = "return";
          arguments[1]["next"] = "end";
          arguments[1]["prev"] = 24;
        }
        let result = originCall.apply(this, arguments);
        return result;
      };
    },
    /**
     * 劫持window下的BoxJSBefore对象调用，它的所有的属性都是函数
     * + 百家号(mbd.baidu.com)
     *
     * window.BoxJSBefore
     */
    hijackBoxJSBefore() {
      Object.defineProperty(unsafeWindow, "BoxJSBefore", {
        get() {
          return new Proxy(
            {},
            {
              get(target, name, receiver) {
                log.success("劫持BoxJSBefore调用：" + name);
              },
            }
          );
        },
      });
    },
  };

  /* --------------调试-------------- */
  if (DEBUG) {
    unsafeWindow.GM_Debug_WhiteSev = {
      httpx,
      log,
      utils,
      DOMUtils,
      Viewer,
      GM_Menu,
      GM_addStyle,
      GM_registerMenuCommand,
      GM_unregisterMenuCommand,
      GM_getValue,
      GM_setValue,
      GM_deleteValue,
      GM_listValues,
      GM_xmlhttpRequest,
      GM_info,
      window,
      globalThis,
    };
  }
  /* --------------调试-------------- */

  /* --------------入口-------------- */
  const loadingView = new LoadingView(true);
  unsafeWindow.loadingView = loadingView;
  baidu.init();
  /* --------------入口-------------- */
})();
