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
					submit: 'Add to Favorites',
					update: 1
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

exports.SiteData = ( name, data) => {
	if(localStorage.getItem('UserCookie')){
		var string = localStorage.getItem('UserCookie').split(';');
		for(var i in string){
			if(string[i].indexOf(name) != -1){
				if(data){
					string[i] = string[i].substr(0,string[i].lastIndexOf('=')+1) + data;
				}else{
					return string[i].substr(string[i].lastIndexOf('=')+1);
				}
			}
		}
		if(data){ localStorage.setItem('UserCookie', string.join(';')); global.update_usercookie(); }
	}
	return false;
}

exports.uConfig = ( string, name, data) => {
	var chg = 0;
	if(data) chg = 1;
	if(string){
		string = string.split('-');
		console.log(string);
		for(var i in string){
			if(string[i].indexOf(name) != -1){
				if(data){
					string[i] = string[i].substr(0,string[i].lastIndexOf('_')+1) + data;
					chg = 0;
				}else{
					return string[i].substr(string[i].lastIndexOf('_')+1);
				}
			}
		}
		i++;
		if(chg==1)
			string[i] = name +'_'+ data;
		if(data) return  exports.SiteData('uconfig',string.join('-'));
	}
}