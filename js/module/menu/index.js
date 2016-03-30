
  /*右鍵目錄區*/
  const remote = require('electron').remote;
  const Menu = remote.Menu;
  const MenuItem = remote.MenuItem;
  const shell = require('electron').shell;
  var menu;
  var $ = global.$;
  function appendmenu(data){
    //Menu.append(new global.gui.MenuItem(data));
    menu.append(new MenuItem(data));
  }

  window.document.body.addEventListener('contextmenu', function(ev) { 
    ev.preventDefault();
    menu = new Menu();
    const clipboard = require('electron').clipboard;
    if(window.getSelection&&window.getSelection().toString()){
       appendmenu({label:'複製',click:function(){window.document.execCommand("copy");}});
       //appendmenu({label:'剪下',click:function(){document.execCommand("cut");}});
    }
    if(clipboard.readText()!=null&$(ev.target).is(":focus")){
       appendmenu({label:'貼上',click:function(){window.document.execCommand("paste");}});
    }
    var list = $(ev.target).closest('.view-detail');
    if(list.length){
      appendmenu({label:'開啟原始網址',click:function(){
        shell.openExternal(list.attr('data-url'));
        //global.gui.Shell.openExternal(list.attr('data-url'));
      }});
    }
    if(menu.items.length)
    menu.popup(ev.x, ev.y);
    return false;
  });
  /*右鍵目錄區*/