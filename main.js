/*
 * Copyright (c) 2015 Rocco De Patto. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/* global define, brackets */

define(function (require, exports, module) {

  'use strict';

  var EditorManager = brackets.getModule('editor/EditorManager'),
    NodeDomain = brackets.getModule("utils/NodeDomain"),
    ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
    CommandManager = brackets.getModule("command/CommandManager"),
    Menus = brackets.getModule("command/Menus"),
    ProjectManager = brackets.getModule("project/ProjectManager"),
    CoverageDomain = new NodeDomain("Coverage", ExtensionUtils.getModulePath(module, "node/coverage"));
    //

  var lcov_file = null;
  var lcov_data = null;
  var project_root = '';

  function toggle() {
    // devo cercare se nei data trovo delle info su questo file !
    var editor = EditorManager.getActiveEditor();
    var current_file = editor.getFile()._path.replace(project_root,'');
    var data = getCurrentData(current_file);
    console.log(data.lines.details[0]);
    data.functions.details.forEach(function(detail){
      console.log(detail);
    });
    data.lines.details.forEach(function(detail){
      console.log(detail);
      if(detail.hit===1)
        editor._codeMirror.addLineClass(detail.line-1,'background','coveraged');
    });


  }

  function getCurrentData(current_file){
    console.log(project_root);

    return lcov_data.filter(function(e){
      return (e.file.indexOf(current_file)!==-1);
    })[0];


  }

  ExtensionUtils.loadStyleSheet(module, "coverage.css");

  var MY_COMMAND_ID = "coverage.toggle";
  CommandManager.register("Toggle Coverage highlight", MY_COMMAND_ID, toggle);

  var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
  menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-Q");


  // a new project is opened !
  // has to search for a lcov file..
  function projectOpen(evt,project){
    project_root = project._path;
    ProjectManager.getAllFiles(function(file){
      if(file._path.indexOf('node_modules')!==-1) return false;
      return file._path.indexOf('.lcov',file._path.index - 5) !== -1;
    }).then(function(a){
      lcov_file = a[0]._path;
      CoverageDomain.exec('parse',lcov_file).done(function(data){
        console.log(data);
        console.log(data[0]);
        lcov_data = data;
      }).fail(function(err){
        console.error("[coverage] failed to parse lcov file: %s", err);
      });
    });
  }

  ProjectManager.on('projectOpen',projectOpen);


  // Helper function that runs the simple.getMemory command and
  // logs the result to the console
  //function logMemory() {
    //CoverageDomain.exec("getLCov", "/home/lesion/dev/karma/build/reports/coverage/report-lcov/lcov.info")
      //.done(function (lcov) {
        //console.log(
          //lcov[0]
        //);
      //}).fail(function (err) {
        //console.error("[brackets-simple-node] failed to run simple.getMemory", err);
      //});
  //}


});
