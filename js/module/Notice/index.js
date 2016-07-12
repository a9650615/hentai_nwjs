  var exports = module.exports = {};

  exports.alert = ( data ) => {
      if(typeof data == 'object')
      var options = {
            icon: ".\\stylesheet\\icon.png",
            body: data.message
        };
      else
        var options = {
            icon: ".\\stylesheet\\icon.png",
            body: data
        };
      var notification = new Notification("提示",options);
        notification.onclick = function () {
            notification.close();
        }

        notification.onshow = function () {
          // play sound on show
          //myAud=document.getElementById("audio1");
          //myAud.play();

          // auto close after 1 second
          //setTimeout(function() {notification.close();}, 6000);
        };
  };