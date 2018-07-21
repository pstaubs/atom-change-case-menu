'use babel';

import ChangeCaseMenuView from './change-case-menu-view';
import { CompositeDisposable } from 'atom';

export default {

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

  toggle() {
    if(this.modalPanel.isVisible()) {return this.modalPanel.hide();}
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      if(editor.getSelectedText()){
        this.changeCaseMenuView.setParent(this);
        this.changeCaseMenuView.populate(editor.getSelectedText());
        this.modalPanel.show();
        this.changeCaseMenuView.selectListView.focus();
      }
    }
  }

};
