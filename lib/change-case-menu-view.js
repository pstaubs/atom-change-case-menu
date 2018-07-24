'use babel';

var changeCase = require('change-case');
import SelectListView from 'atom-select-list';

export default class ChangeCaseMenuView {

  basicCases = {
    'lowerCase':     changeCase.lowerCase,
    'upperCase':     changeCase.upperCase,
    'sentenceCase':  changeCase.sentenceCase,
    'titleCase':     changeCase.titleCase
  };
  advancedCases = {
    'lowerCaseFirst':changeCase.lowerCaseFirst,
    'upperCaseFirst':changeCase.upperCaseFirst,
    'swapCase':      changeCase.swapCase
  };
  programmingCases = {
    'camelCase':     changeCase.camelCase,
    'constantCase':  changeCase.constantCase,
    'dotCase':       changeCase.dotCase,
    'headerCase':    changeCase.headerCase,
    'paramCase':     changeCase.paramCase,
    'pascalCase':    changeCase.pascalCase,
    'pathCase':      changeCase.pathCase,
    'snakeCase':     changeCase.snakeCase
  };



  constructor(serializedState) {
    this.value = '';
    this.displayValue = '';

    // Create root element
    this.element = document.createElement('div');
    this.element.id = 'change-case-menu'
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

    // Setup case style list from config options
    this.setup();
    this.cases = Object.assign({}, {'predictive':this.predictive}, this.basicCases, this.advancedCases, this.programmingCases);
    atom.config.onDidChange('atom-change-case-menu.showPredictiveCase',   (newValue) => {this.setup();});
    atom.config.onDidChange('atom-change-case-menu.showBasicCases',       (newValue) => {this.setup();});
    atom.config.onDidChange('atom-change-case-menu.showAdvancedCases',    (newValue) => {this.setup();});
    atom.config.onDidChange('atom-change-case-menu.showProgrammingCases', (newValue) => {this.setup();});
    atom.config.onDidChange('atom-change-case-menu.showCustomCases',      (newValue) => {this.setup();});

    // Create list menu
    this.selectListView = new SelectListView({
      emptyMessage: 'No case styles found. Be sure to select at least one group of case styles in this package\'s settings.',
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
        this.edit(key, this.value);
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

  // Hide panel when selection is done or is cancelled
  end() {
    for  (panel of atom.workspace.getModalPanels()) {
      panel.hide();
    }
  }

  // Edit text
  edit(key, value) {
    atom.workspace.getActiveTextEditor().insertText(this.cases[key](value), {select:true});
  }

  // Setup case style list from config options
  setup() {
    this.casesToShow = {}
    if(atom.config.get('atom-change-case-menu.showPredictiveCase')) {
      this.casesToShow = Object.assign({}, this.casesToShow, {'predictive':this.predictive});
    }
    if(atom.config.get('atom-change-case-menu.showBasicCases')) {
      this.casesToShow = Object.assign({}, this.casesToShow, this.basicCases);
    }
    if(atom.config.get('atom-change-case-menu.showAdvancedCases')) {
      this.casesToShow = Object.assign({}, this.casesToShow, this.advancedCases);
    }
    if(atom.config.get('atom-change-case-menu.showProgrammingCases')) {
      this.casesToShow = Object.assign({}, this.casesToShow, this.programmingCases);
    }
    if(atom.config.get('atom-change-case-menu.showCustomCases')) {
      this.casesToShow = Object.assign({}, this.casesToShow, this.getCustomCases());
    }
  }

  // Parse user-defined list of case styles
  getCustomCases() {
    cases = {};
    for(caseString of atom.config.get('atom-change-case-menu.defineCustomCases').split(',')) {
      if(caseString.trim() in this.basicCases) {
        cases[caseString.trim()] = this.basicCases[caseString.trim()]
      }else if(caseString.trim() in this.advancedCases) {
        cases[caseString.trim()] = this.advancedCases[caseString.trim()]
      }else if(caseString.trim() in this.programmingCases) {
        cases[caseString.trim()] = this.programmingCases[caseString.trim()]
      }else if(caseString.trim() != ''){
        atom.notifications.addError('Atom Case Change Menu: Invalid case definition "'+caseString+'"', {
          detail: "Possible case definitions include: camelCase, constantCase, dotCase, headerCase, lowerCase, lowerCaseFirst, paramCase, pascalCase, pathCase, sentenceCase, snakeCase, swapCase, titleCase, upperCase, upperCaseFirst."
        })
        return cases;
      }
    }
    return cases;
  }

  // Guess at the case change to use
  predictive(text) {
    if(text == text.toUpperCase()) {
      return text.toLowerCase();
    }else if(text[0].match(/[a-z]/i) && text == text.toLowerCase()) {
      return changeCase.sentenceCase(text);
    }else {
      return text.toUpperCase();
    }
  }

  // Return this element
  getElement() {
    return this.element;
  }

  // Update live preview, i.e. when searching or navigating with keys
  updatePreview(key='lowerCase', maxPreviewLength=60) {
    try {
      content = (this.value.length > maxPreviewLength) ? this.cases[key](this.value.substr(0,maxPreviewLength-6))+' [...]' : this.cases[key](this.value);
      document.getElementById('change-case-menu-preview').textContent = content;
    }catch(err){}
  }

  // Fill selectListView using all available cases
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
    this.selectListView.update({items: Object.keys(this.casesToShow)});
  }

}
