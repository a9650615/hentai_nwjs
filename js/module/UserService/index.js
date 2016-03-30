let request = require('request');

var exports = module.exports = {};

/*
exports.report = function( from , data){
	console.log('錯誤回報'+from);
}*/

let Urls = {
	addfavorite: 'http://exhentai.org/gallerypopups.php?gid={gid}&t={token}&act=addfav'
};

exports.AddToFavorite = ( id, token, data)  => {
	let promise = new Promise( ( resolve ) => {
		if(localStorage.getItem('UserName')){
			request.post({
				url: Urls.addfavorite.replace('{gid}', id).replace('{token}', token),
				form: {
					favcat: data.favcat,
					favnote: data.favnote,
					submit: 'Add to Favorites'
				},
				headers: {
					'Cookie':  global.Setting.UserCookie
				}
			}, ( err, httpRes, body) => {
				if(body.indexOf('The requested action has been performed')!=-1){
					resolve(1);
				}
				resolve(-1);
			});
		};	
	});
	return promise;
}

exports.CheckFavorite  = ( id, token)  => {
	let promise = new Promise( ( resolve ) => {
		if(localStorage.getItem('UserName')){
			request.post({
				url: Urls.addfavorite.replace('{gid}', id).replace('{token}', token),
				form: {},
				headers: {
					'Cookie':  global.Setting.UserCookie
				}
			}, ( err, httpRes, body) => {
				if(body.indexOf('Remove from Favorites')!=-1){
					resolve(true);
				}
				resolve(false);
			});
		};	
	});
	return promise;
};