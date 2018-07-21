'use babel';

var changeCase = require('change-case');
import SelectListView from 'atom-select-list';

export default class ChangeCaseMenuView {

  constructor(serializedState) {
    this.panel = null
    this.modalPanel = null
    this.value = '';
    this.displayValue = '';

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('change-case-menu');

    // Create preview element
    const message = document.createElement('div');
    message.textContent = 'Text preview';
    message.id = 'change-case-menu-preview';
    message.classList.add('change-case-menu-preview', 'text-info');
    message.style.margin = '12px';
    message.style.fontSize = '15px';
    message.style.fontWeight = 'bold';
    this.element.appendChild(message);


    this.cases = {
      'camelCase':     changeCase.camelCase,
      'constantCase':  changeCase.constantCase,
      'dotCase':       changeCase.dotCase,
      'headerCase':    changeCase.headerCase,
      'lowerCase':     changeCase.lowerCase,
      'lowerCaseFirst':changeCase.lowerCaseFirst,
      'paramCase':     changeCase.paramCase,
      'pascalCase':    changeCase.pascalCase,
      'pathCase':      changeCase.pathCase,
      'sentenceCase':  changeCase.sentenceCase,
      'snakeCase':     changeCase.snakeCase,
      'swapCase':      changeCase.swapCase,
      'titleCase':     changeCase.titleCase,
      'upperCase':     changeCase.upperCase,
      'upperCaseFirst':changeCase.upperCaseFirst
    };

    // Create list menu
    this.selectListView = new SelectListView({
      emptyMessage: 'No cases found.',
      items: [],
      filterKeyForItem: (key) => key,
      elementForItem: (key) => {
        const li = document.createElement('li')
        li.classList.add('two-lines')

        const primaryLine = document.createElement('div')
        primaryLine.classList.add('primary-line')
        primaryLine.id = 'change-case-menu-'+key;
        primaryLine.textContent = key
        li.appendChild(primaryLine)

        const secondaryLine = document.createElement('div')
        secondaryLine.classList.add('secondary-line')
        secondaryLine.textContent = this.cases[key](this.displayValue)+this.displayElipses
        li.appendChild(secondaryLine)

        return li
      },
      didConfirmSelection: (key) => {
        atom.workspace.getActiveTextEditor().insertText(this.cases[key](this.value), {select:true});
        this.end();
      },
      didConfirmEmptySelection: () => {
        this.end();
      },
      didCancelSelection: () => {
        this.end();
      },
      didChangeSelection: (key) => {
        this.updatePreview(key);
      }
    });
    this.element.appendChild(this.selectListView.element);

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  end() {
    for  (panel of atom.workspace.getModalPanels()) {
      panel.hide()
    }
  }

  getElement() {
    return this.element;
  }


  setParent(modalPanel) {
    this.modalPanel = modalPanel
  }


  updatePreview(key='lowerCase', maxPreviewLength=60) {
    try {
      content = (this.value.length > maxPreviewLength) ? this.cases[key](this.value.substr(0,maxPreviewLength-6))+' [...]' : this.cases[key](this.value);
      document.getElementById('change-case-menu-preview').textContent = content;
    }catch(err){}
  }


  populate(value, maxLengthforList=100) {
    this.value = value;
    if(this.value.length > maxLengthforList) {
      this.displayValue = this.value.substr(0,maxLengthforList-1);
      this.displayElipses = ' [...]';
    }else{
      this.displayValue = this.value;
      this.displayElipses = '';
    }
    this.updatePreview()
    this.selectListView.update({items: Object.keys(this.cases)});
  }

}
