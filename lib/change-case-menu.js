'use babel';

import ChangeCaseMenuView from './change-case-menu-view';
import { CompositeDisposable } from 'atom';

export default {

  config: {
    showPredictiveCase: {
      type: 'boolean',
      title: 'Have the first result attempts to predict the desired case change using the quick cycle command',
      description: 'This operation will generally cycle through: Sentence case, UPPERCASE, and lowercase. This operation can also be launched directly via this module\'s `cycle` command, which defaults to the hotkey Shift+F3.',
      default: true,
      order: 1
    },
    showBasicCases: {
      type: 'boolean',
      title: 'Include basic case styles',
      description: 'Includes lowercase, UPPERCASE, Sentence case, and Title Case. Great for writing.',
      default: true,
      order: 2
    },
    showAdvancedCases: {
      type: 'boolean',
      title: 'Include advanced case styles',
      description: 'Includes lOWERCASEFIRST, Uppercasefirst, and sWAP cASE. If you need a bit more versatility.',
      default: false,
      order: 3
    },
    showProgrammingCases: {
      type: 'boolean',
      title: 'Include technical case styles',
      description: 'Includes camelCase, CONSTANT_CASE, dot.case, Header-Case, param-case, PascalCase, path/case, win\\path\\case, and snake_case. Great for programming.',
      default: false,
      order:4
    },
    showCustomCases: {
      type: 'boolean',
      title: 'Include a user-defined list of case styles',
      description: 'Don\'t like the above groups? Make your own! The user-defined list is specified in the next setting. Cycle this setting to refresh the menu if you make changes below.',
      default: false,
      order:5
    },
    defineCustomCases: {
      type: 'string',
      title: 'Comma seperated list of user-defined case styles',
      description: 'Valid choises: `camelCase`, `constantCase`, `dotCase`, `headerCase`, `lowerCase`, `lowerCaseFirst`, `paramCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase`, `swapCase`, `titleCase`, `upperCase`, `upperCaseFirst`, and `winPathCase`.',
      default: '',
      order:6
    }
  },


  changeCaseMenuView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.changeCaseMenuView = new ChangeCaseMenuView(state.changeCaseMenuViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.changeCaseMenuView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:list':          () => this.toggle()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:cycle':         () => this.changeCase('predictive')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:lower':         () => this.changeCase('lowerCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:lowerFirst':    () => this.changeCase('lowerCaseFirst')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:sentence':      () => this.changeCase('sentenceCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:title':         () => this.changeCase('titleCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:upper':         () => this.changeCase('upperCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:upperFirst':    () => this.changeCase('upperCaseFirst')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:camel':         () => this.changeCase('camelCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:constant':      () => this.changeCase('constantCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:dot':           () => this.changeCase('dotCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:param':         () => this.changeCase('paramCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:header':        () => this.changeCase('headerCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:pascal':        () => this.changeCase('pascalCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:path':          () => this.changeCase('pathCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:snake':         () => this.changeCase('snakeCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:swap':          () => this.changeCase('swapCase')}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'change-case-menu:winPath':       () => this.changeCase('winPathCase')}));


  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.changeCaseMenuView.destroy();
  },

  serialize() {
    return {
      changeCaseMenuViewState: this.changeCaseMenuView.serialize()
    };
  },

  changeCase(caseStyle) {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      if(editor.getSelectedText()){
        this.changeCaseMenuView.edit(caseStyle,editor.getSelectedText());
      }
    }
  },

  toggle() {
    if(this.modalPanel.isVisible()) {return this.modalPanel.hide();}
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      if(editor.getSelectedText()){
        this.changeCaseMenuView.populate(editor.getSelectedText());
        this.modalPanel.show();
        this.changeCaseMenuView.selectListView.focus();
      }
    }
  }

};
