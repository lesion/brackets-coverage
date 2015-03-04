/* global define, brackets */
define(function (require, exports, module) {
  'use strict';


  var ProjectManager = brackets.getModule("project/ProjectManager"),
    ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
    NodeDomain = brackets.getModule("utils/NodeDomain"),
    CommandManager = brackets.getModule("command/CommandManager"),
    Menus = brackets.getModule("command/Menus"),
    EditorManager = brackets.getModule('editor/EditorManager'),
    CoverageDomain = new NodeDomain("CoverageDomain",
      ExtensionUtils.getModulePath(module, "node/CoverageDomain"));

  var EXTENSION_ICON_ID = 'coverage_icon',
    EXTENSION_NAME = 'Coverage',
    _self;


  function Coverage() {
    this.active = false;
    this.lcov_file = null;
    this.lcov_data = null;
    this.local_data = null;
    this.editor = null;
  }


  Coverage.prototype.init = function () {
    _self = this;
    console.log("[coverage] Init!");

    // adding icon to extension toolbar
    $(document.createElement('a'))
      .html('C')
      .attr('id', EXTENSION_ICON_ID)
      .attr('href', '#')
      .attr('title', EXTENSION_NAME)
      .on('click', this._toggle.bind(this))
      .appendTo($('#main-toolbar .buttons'));

    ProjectManager.on('projectOpen', this._onProjectChange.bind(this));

    // when starting Brackets, projectOpen is already called on AppInit
    // so we call it manually
    this._onProjectChange();

    EditorManager.on('activeEditorChange', this._onActiveEditorChange.bind(this));

    var MY_COMMAND_ID = "coverage.toggle";
    CommandManager.register("Toggle Coverage highlight", MY_COMMAND_ID, this._toggle.bind(this));

    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-Q");


    // TODO on save, disable this extension
  };

  Coverage.prototype._onActiveEditorChange = function (evt, editor) {
    _self.editor = editor;
    console.log("[coverage] Active editor change");
    var project_root = ProjectManager.getProjectRoot()._path;
    console.log("[coverage] Project root => %s", project_root);
    if (!editor) return;
    var current_file = editor.getFile()._path.replace(project_root, '');
    console.log("[coverage] current_file: %s", current_file);
    console.log(_self);
    console.log(_self.lcov_data);

    if (_self.lcov_data) {
      _self.local_data = _self.lcov_data.filter(function (data) {
        return (data.file.indexOf(current_file) !== -1);
      })[0];
      console.log("Dopo il filtro: ");
      console.log(_self.local_data);
    }


  };


  Coverage.prototype._toggle = function () {
    console.log("[coverage] Inside toggle");
    $('#' + EXTENSION_ICON_ID).toggleClass('active');
    this.active = !this.active;
    if (this.active)
      this._showLines();
    else
      this._hideLines();
  };

  Coverage.prototype._hideLines = function () {
    if (!_self.local_data) return;
    _self.local_data.lines.details.forEach(function (detail) {
      if (detail.hit === 1)
        _self.editor._codeMirror.removeLineClass(detail.line - 1, 'background', 'coveraged');
      else
        _self.editor._codeMirror.removeLineClass(detail.line - 1, 'background', 'uncoveraged');
    });
  };

  Coverage.prototype._showLines = function () {
    if (!_self.local_data) return;

    console.log(_self.local_data.lines);

    //console.log(data.lines.details[0]);
    //data.functions.details.forEach(function(detail){
    //console.log(detail);
    //});
    //

    _self.local_data.lines.details.forEach(function (detail) {
      if (detail.hit === 1)
        _self.editor._codeMirror.addLineClass(detail.line - 1, 'background', 'covered');
      else
        _self.editor._codeMirror.addLineClass(detail.line - 1, 'background', 'uncovered');

    });

  };


  Coverage.prototype._searchLcov = function () {

    var deferred = $.Deferred();

    function isLcov(file) {
      // exclude node_modules path ...
      if (file._path.indexOf('node_modules') !== -1) return false;

      // only match file with .lcov extension
      return file._path.indexOf('.lcov', file._path.index - 5) !== -1;
    }

    // get all file of current project with filter.
    ProjectManager.getAllFiles(isLcov)
      .done(function (matches) {
        console.log("[coverage] Inside matched of done ");
        if (matches.length > 0)
          deferred.resolve(matches[0]._path);
        else
          deferred.reject("[coverage] No **/*.lcov file found!");
      })
      .fail(deferred.reject);

    return deferred.promise();
  };

  Coverage.prototype._parseLCov = function (lcov_file) {

    var deferred = $.Deferred();

    if (!lcov_file) {
      console.error("[coverage] Lcov file not found!");
      deferred.reject("[coverage] Lcov file not present! Try to reload the project!");
      return;
    }

    console.log("[coverage] Parsing %s", lcov_file);
    CoverageDomain.exec('parse', lcov_file)
      .done(function (data) {
        console.log("[coverage] Data acquired!");
        _self.lcov_data = data;
        console.log(data);
        data.forEach(function (e) {
          console.log(e);
        });
        deferred.resolve(data);
      })
      .fail(deferred.reject);

    return deferred.promise();

  };

  Coverage.prototype._onProjectChange = function () {
    console.log("[coverage] disabling and cleaning");
    $('#' + EXTENSION_ICON_ID).removeClass('active');
    this.active = false;
    this.lcov_file = null;
    this.lcov_data = null;
    this._searchLcov()
      .done(_self._parseLCov)
      .fail(function (err) {
        console.log("[coverage] Lcov not found!", err);
      });
  };

  return Coverage;

});
