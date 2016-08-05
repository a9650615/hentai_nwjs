var $ = global.$;

var exports = module.exports = {};

exports.events = () => {
	
}

exports.ChangeSearch = ()  => {
	$('.main-menu').fadeOut(100, () => {
          $('#search-section').fadeIn(100);
          $('#search-bar').focus();
        });
}

exports.MenuHide = () => {
	$('.menu').hide();
}

exports.ChangeMainMenu = () => {
	exports.MenuHide();
	$('.main-menu').fadeIn(200);
}

exports.ChangeMainBack = () => {
	exports.MenuHide();
	$('#back-section').fadeIn(200);
}

exports.BackToMainMenu = () => {
	exports.MenuHide();
	$('.main-menu').fadeIn(200);
}

exports.ClearSearchBar = () => {
	$('#search-bar').val('');
	$('#search-bar').focus();
}