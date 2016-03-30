
let LoginModule = require('./LoginModule.js');

var exports = module.exports = {};

var $ = global.$;

exports.events = () => {
	let username = localStorage.getItem('UserName');
	$('#header .main-menu li[data-index=6]').text(username?username:'登入');
	
	if(localStorage.getItem('UserName')){
		$('#login-box').hide();
	}else{
		$('#view-6-member-setting').hide();
	};

	$('#logout-button').on('click', () => {
		localStorage.removeItem( 'UserName');
		localStorage.removeItem( 'UserCookie');
		$('#login-box').fadeIn(100);
		$('#view-6-member-setting').hide();
		$('#header .main-menu li[data-index=6]').text('登入');
	});

	$('#login-button').on('click',function( ){
		var username = encodeURIComponent($('#login-username').val());
		var password = encodeURIComponent($('#login-password').val());
		$(this).hide();
		LoginModule.Login( username, password).then( ( type, data) => {
			$(this).show();
			$('#login-status').text((type==1)?'登入成功':'登入失敗');
			if(type == 1){
				localStorage.setItem( 'UserName', username);
				setTimeout( () => {
					$('#login-box').fadeOut(300);
					$('#view-6-member-setting').fadeIn(300);
					$('#header .main-menu li[data-index=6]').text(username);
				});
			};
		});
	});
};