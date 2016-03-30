let request = require('request');

var exports = module.exports = {};

let LoginSetting = {
	url : 'https://forums.e-hentai.org/index.php?act=Login&CODE=01',
	referer: 'https://forums.e-hentai.org/index.php',
	UserName: null,
	PassWord: null,
	CookieDate: 1
};

let exhentaiURL = 'http://exhentai.org/';

exports.Login = ( username, password) => {
	let
		Data = LoginSetting,
		promise = new Promise( ( resolve, httpResponse) => {

			Data.UserName = username;
			Data.PassWord = password;
			
			request.post({
				url: LoginSetting.url,
				form: Data
			},	( err, httpResponse, body) => {
				let data = {};
				if(err){
					resolve( -2 , httpResponse) ;//net error
				}else{
					if(body.indexOf('Username or password incorrect') != -1) {
						resolve( -1, httpResponse ) ;
					} else if(body.indexOf('You must already have registered for an account before you can log in') != -1) {
						resolve( 0 , httpResponse) ;
					} else if(body.indexOf('You are now logged in as:') != -1) {
						/*
						 *	取得第一階段(ehentai)cookie
						 */
						let cookie='',split;
						for(let i in httpResponse.headers["set-cookie"]){
							split = httpResponse.headers["set-cookie"][i].split(';');
							cookie += split[0]+';';
						}
						/*
						 *	取得第二階段(exhentai)cookie
						 */
						request.get({
							url: exhentaiURL,
							headers: {
								'Cookie': cookie
							}
						}, ( err,  res,  body) => {
							for(let i in res.headers["set-cookie"]){
								split = res.headers["set-cookie"][i].split(';');
								cookie += split[0]+';';
							}
							data.cookie = cookie;
							localStorage.setItem('UserCookie', cookie);
						});
						resolve( 1, httpResponse) ;
					};
				}
			});
		
		});
	
	return promise;
}