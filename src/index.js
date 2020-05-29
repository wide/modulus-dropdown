import Component  from '@wide/modulus/src/component'
import hotkeys    from 'hotkeys-js'


/**
 * Screen percent under which the dropdown open to top
 * @type {Number}
 */
export const DEFAULT_THRESHOLD = 60

/**
 * Default elements CSS classes
 * @type {Object<string, String>}
 */
export const DEFAULT_CLASSLIST = {
  main:     'dropdown',
  current:  'dropdown_current',
  caret:    'dropdown_caret',
  list:     'dropdown_list',
  item:     'dropdown_item',
  group:    'dropdown_group',
  label:    'dropdown_label',
  open:     '-open',
  top:      '-top'
}


/**
 * Dropdown component
 */
export default class Dropdown extends Component {


  /**
   * Initialize component
   * @param {Object} cfg
   * @param {Object<string, String>} cfg.classlist
   * @param {Number} cfg.threshold
   */
  run({ classlist, threshold } = {}) {

    /**
     * Elements CSS classes
     * @type {Object<string, String>}
     */
    this.classlist = Object.assign({}, DEFAULT_CLASSLIST, classlist)

    /**
     * Screen percent under which the dropdown open to top
     * @type {Number}
     */
    this.threshold = threshold || DEFAULT_THRESHOLD

    /**
     * Wether the dropdown is open or not
     * @type {Boolean}
     */
    this.isOpen = false

    /**
     * Inner elements to interact with
     * @type {Object<string, HTMLElement>}
     */
    this.els = {}

    // render Dropdown around the <select>
    this.render()
  }


  /**
   * Generate dropdown HTML
   */
  render() {

    // reset if already rendered
    this.restore()

    // generate Dropdown html
    const html = this.renderMain()

    // connect Dropdown to DOM
    this.els.main = this.attachToDOM(html)

    // fetch Dropdown children
    this.els.current = this.els.main.querySelector(`.${this.classlist.current}`)
    this.els.list = this.els.main.querySelector(`.${this.classlist.list}`)
    this.els.items = Array.from(this.els.list.querySelectorAll(`.${this.classlist.item}`))
    this.els.label = document.querySelector(`label[for="${this.el.id}"]`)

    // listen children events to fake <select> behavior
    this.listen()

    // trigger change once to set initial value
    this.change(this.el.value)
  }


  /**
   * Restore state to its origin
   */
  restore() {
    if(this.els.main) {

      // kill all listeners
      this.destroy()

      // move <select> out of Dropdown
      this.els.main.parentNode.insertBefore(this.el, this.els.main)

      // nuke Dropdown element
      this.els.main.parentNode.removeChild(this.els.main)

      // reset state
      this.isOpen = false
      this.els.items = []
    }
  }


  /**
   * Render main HTML
   * @return {String}
   */
  renderMain() {
    return `
      <button type="button"
              class="${this.classlist.current}"
              id="${this.el.id}-current"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-controls="${this.el.id}-list"></button>
      <span class="${this.classlist.caret}"></span>
      <ul class="${this.classlist.list}"
          id="${this.el.id}-list"
          role="listbox"
          aria-labelledby="${this.el.id}-current">
        ${this.renderItems(this.el.children)}
      </ul>`
  }


  /**
   * Render list HTML
   * @param {NodeList} items 
   * @return {String}
   */
  renderItems(items) {
    let html = ''
    for(let i = 0; i < items.length; i++) {
      html += (items[i] instanceof HTMLOptGroupElement)
        ? this.renderGroup(items[i])
        : this.renderItem(items[i])
    }
    return html
  }


  /**
   * Render group HTML
   * @param {HTMLElement} optgroup 
   * @return {String}
   */
  renderGroup(optgroup) {
    return `
      <li>
        <ul class="${this.classlist.group} ${optgroup.classList}" role="group">
          <li class="${this.classlist.label}">${optgroup.label}</li>
          ${this.renderItems(optgroup.children)}
        </ul>
      </li>`
  }


  /**
   * Render option HTML
   * @param {HTMLElement} opt 
   * @return {String}
   */
  renderItem(opt) {
    return `
      <li>
        <button type="button"
                class="${this.classlist.item} ${opt.classList}"
                value="${opt.value}"
                role="option">${opt.dataset.content || opt.text}</button>
      </li>`
  }


  /**
   * Connect generated HTML into the DOM
   * @param {String} html 
   * @return {HTMLElement}
   */
  attachToDOM(html) {

    const main = document.createElement('div')
    main.classList.add(this.classlist.main)
    main.innerHTML = html

    this.el.removeAttribute('is') // fix recursion issue
    this.el.parentNode.insertBefore(main, this.el)
    main.appendChild(this.el)
    return main
  }


  /**
   * Listen multiple events
   */
  listen() {

    // focus on label click
    if(this.els.label) {
      this.els.label.addEventListener('click', e => this.els.current.focus())
    }

    // update from <select>
    this.el.addEventListener('change', e => this.change(this.el.value))

    // update from items
    for(let i = 0; i < this.els.items.length; i++) {
      this.els.items[i].addEventListener('click', e => this.change(this.els.items[i].value, true))
    }

    // toggle list on current button click
    this.els.current.addEventListener('click', e => this.toggle())

    // navigate using keyboard
    hotkeys('up', e => this.moveFocus(true, e))
    hotkeys('down', e => this.moveFocus(false, e))

    // close on ESC key
    hotkeys('esc', e => this.close())

    // close on blur (click outside)
    document.addEventListener('click', e => this.closeOnBlur(e))
  }


  /**
   * Open or close based on current state
   */
  toggle() {
    this.isOpen ? this.close() : this.open()
  }


  /**
   * Open list and add `-open` to dropdown element
   */
  open() {

    // ignore if already open
    if(this.isOpen) return;
    this.isOpen = true

    // should open to top ?
    const position = this.els.main.getBoundingClientRect().top * 100 / window.innerHeight
    const onTop = position >= this.threshold
    this.els.main.classList[onTop ? 'add' : 'remove'](this.classlist.top)

    // open list
    this.els.main.classList.add(this.classlist.open)
    this.els.current.setAttribute('aria-expanded', true)

    // focus current value
    for(let i = 0; i < this.el.options.length; i++) {
      if(this.el.options[i].selected) {
        this.els.items[i].focus()
      }
    }
  }


  /**
   * Close list and remove `-open` to dropdown element
   * @param {Boolean} refocus
   */
  close(refocus = true) {

    // ignore if already close
    if(!this.isOpen) return;
    this.isOpen = false

    // close list
    this.els.main.classList.remove(this.classlist.open)
    this.els.current.setAttribute('aria-expanded', false)

    // focus current
    if(refocus) {
      this.els.current.focus()
    }
  }


  /**
   * Update <select> value and trigger `change` event
   * @param {String} value
   * @param {Boolean} notify
   */
  change(value, notify = false) {

    // update current button
    const itemIndex = Array.from(this.el.options).findIndex(o => o.value === value)
    const itemCurrent = this.el.options[itemIndex]
    this.els.current.innerHTML = itemCurrent.dataset.content || itemCurrent.text
    this.els.current.setAttribute('data-index', itemIndex)

    // update <select> value
    this.el.value = value
    for(let i = 0; i < this.el.options.length; i++) {
      if(this.el.options[i].value === value) {
        this.el.selectedIndex = i
        this.el.options[i].setAttribute('selected', 'selected')
      }
      else {
        this.el.options[i].removeAttribute('selected')
      }
    }

    // spread component event
    this.emit('change')
    if(notify) {
      this.el.dispatchEvent(new CustomEvent('change'))
    }

    // close list
    this.close()
  }


  /**
   * Move focus between options
   * @param {Boolean} up
   * @param {Event} e
   */
  moveFocus(up, e) {

    // stop event
    e.stopPropagation()

    // get current index
    let index = this.els.items.findIndex(item => item === document.activeElement)

    // define new index
    if(index === -1) index = 0 // no focus yet, set first
    else if(up && index > 0) index-- // move up
    else if(!up && index < (this.els.items.length - 1)) index++

    // set focus on new index
    this.els.items[index].focus()

    return false
  }


  /**
   * Listen click on outside of dropdown and close
   */
  closeOnBlur(e) {
    if(this.els.main !== e.target && !this.els.main.contains(e.target)) {
      this.close(false)
    }
  }


  /**
   * When element is removed from DOM
   */
  destroy() {
    this.el.removeEventListener('change', e => this.change(this.el.value))
    document.removeEventListener('click', e => this.closeOnBlur(e))
    hotkeys.unbind('down', e => this.moveFocus(false, e))
    hotkeys.unbind('up', e => this.moveFocus(true, e))
    hotkeys.unbind('esc', e => this.close())
  }

}
