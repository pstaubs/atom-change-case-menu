'use babel';

import ChangeCaseMenuView from './change-case-menu-view';
import { CompositeDisposable } from 'atom';

export default {

  config: {
    showPredictiveCase: {
      type: 'boolean',
      title: 'Have the first result attempts to predict the desired case change',
      description: 'This operation will generally rotate through: Sentence case, UPPERCASE, and lowercase. This operation can also be launched directly with the command "change-case-menu:feeling-lucky".',
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
      description: 'Includes camelCase, CONSTANT_CASE, dot.case, Header-Case, param-case, PascalCase, path/case, and snake_case. Great for programming.',
      default: false,
      order:4
    },
    showCustomCases: {
      type: 'boolean',
      title: 'Include a user-defined list of case styles',
      description: 'Don\'t like the above groups? Make your own! The user-defined list is specified in the next setting.',
      default: false,
      order:5
    },
    defineCustomCases: {
      type: 'string',
      title: 'Comma seperated list of user-defined case styles',
      description: 'Valid choises: camelCase, constantCase, dotCase, headerCase, lowerCase, lowerCaseFirst, paramCase, pascalCase, pathCase, sentenceCase, snakeCase, swapCase, titleCase, upperCase, upperCaseFirst',
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
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'change-case-menu:list': () => this.toggle()
    }));
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'change-case-menu:feeling-lucky': () => this.feelingLucky()
    }));
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

  feelingLucky() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      if(editor.getSelectedText()){
        this.changeCaseMenuView.edit('predictive',editor.getSelectedText());
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
