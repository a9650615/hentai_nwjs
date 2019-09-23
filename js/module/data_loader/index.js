var exports = module.exports = {};

var http = require('http');
const axios = require('axios')
const cheerio = require('cheerio')
// var request = require('request');

var data = {
	cookie : global.Setting.UserCookie,
	data   : JSON.stringify({ })
};

var options = {
    //  host: global.Data.data.base.replace('http://',''),
    //  baseUrl: global.Data.data.base,
    //  port: 443,
		//  path: '/',
		url: global.Data.data.base,
		method: 'get',
		headers: {
				// 'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
        'Cookie': 'yay=louder; SL_GWPT_Show_Hide_tmp=1; SL_wptGlobTipTmp=1; ipb_member_id=2782198; ipb_pass_hash=5da4bd53ba861541b8e2c60f07308ba2; ipb_session_id=ff6088e599f3cc9a17a49cb9f61c2ac4; igneous=05336c39e; sk=fxuqiqo3741kvam1w6epif7cm1l5;',
        'Accept': '/',
        'Connection': 'keep-alive'
		},
		responseType: 'text',
		withCredentials: true,
		timeout: 60000
};

exports.change_cookie = () => {
	data.cookie = global.Setting.UserCookie;
	options.headers.Cookie = data.cookie;
}

exports.load_url = function ( url, returnfuc){
	// exports.change_cookie();
	var html = '';
	options.url = global.Data.data.base+(url?'/'+url:null) || '/';
	console.log(options);
	console.log('loading:'+options.url);
	// var request = http.request(options , function( res){
	// 	  //console.log('STATUS: ' + res.statusCode);
	// 	  //console.log('HEADERS: ' + JSON.stringify(res.headers));
	// 		res.setEncoding('utf8');
	// 	  //´æÈ¡ÙYÁÏÖÐ
	// 	  res.on('data', function (chunk) {	
	// 	    html += chunk;
	// 	  });
		  
	// 	  res.on('end', function (part) {
	// 					returnfuc( html, res, null);
	// 					console.log(html)
	// 	  });

	// 	  res.on('error',function(e){
	// 	  	global.Service.report( 'data_loader', e);
	// 	  });
	// });
	
	// request.on('error',function(e){
  //  		console.log("Error: \n" + e.message); 
  //  		console.log( e.stack );
  //  		//returnfuc( html, res, e);
  //  		exports.load_url( url, returnfuc);
	// });
	// request.end();
	axios.request(options).then((response) => {
		// console.log(returnfuc);
		returnfuc( response.data, {}, null);
	})
}

var $ = window.$;
var praser = {
	html: null,
	data: {},
	_p : function( html){
		this.data = {};
		try{
			// this.html =  window.$(html);
			this.html = cheerio.load(html)
		}catch(e){

		};
	},
	ret:function( req){
		req( this.data, null);
	},
	list : function( html, req){
		this._p(html);
		var rank = 0,data={},t;
		try{
			this.html('.gltc tr:not(:first-child)').each(function(i,e){
				// console.log(e);
				// rank = 0;
				// t = cheerio.load(this);
				// data[i] = {};
				// data[i].type= t('td.itdc>a>img').attr('alt');
				// data[i].publish = t('td.itd').first().text();
				// if(i==0)
				// data[i].img = t('td.itd:eq(1)>div>div.it2>img').attr('src');
				// else{
				// 	data[i].img = t('td.itd:eq(1)>div>div.it2').text().split('~');
				// 	data[i].img = 'http://'+data[i].img[1]+'/'+data[i].img[2];
				// }
				// data[i].name = t('td.itd').eq(1).find('div>div.it5>a').text();
				// data[i].href = t('td.itd:eq(1)>div>div.it5>a').attr('href');
				// data[i].torrent = t('td.itd:eq(1)>div>div.it3>div>a').attr('href');
				// data[i].rank = t('td.itd:eq(1)>div>div.it4>div.it4r').css('background-position');
				// data[i].rank = data[i].rank.match(/[+\-]?\d*px/g);
				// if(data[i].rank[1]=='-21px'){
				// 	rank -= 0.5;
				// };
				// rank+=5+(parseInt(data[i].rank[0])/16);
				// data[i].rank = rank;
				// data[i].uploader={
				// 	href : t('td.itu>div>a').attr('href'),
				// 	name : t('td.itu>div>a').text()
				// }; 
				const rank = 0, t = cheerio.load(this), itdEq1 = t('td.itd').eq(1);
				data[i] = {};
				data[i].type= t('td.gl1c>div').text();
				// data[i].publish = t('td.itd').first().text();
				console.log(t('.gl2c>.glthumb').html())
				data[i].img = t('.gl2c>.glthumb>div').eq(0).find('img').attr('src')
				// if(i !== 0){
				// 	data[i].img = itdEq1.find('div>div.it2').text().split('~');
				// 	data[i].img = 'http://'+data[i].img[1]+'/'+data[i].img[2];
				// }
				// data[i].title = itdEq1.find('div>div.it5>a').text();
				// data[i].href = itdEq1.find('div>div.it5>a').attr('href');
				// // data[i].data = data[i].href.replace(`${API_HOST}g/`, '').split('/').splice(0, 2);
				// data[i].torrent = itdEq1.find('>div>div.it3>div>a').attr('href');
				// data[i].rank = itdEq1.find('div>div.it4>div.it4r').css('background-position');
				// data[i].rank = data[i].rank.match(/[+\-]?\d*px/g);
				// if (data[i].rank[1]=='-21px') {
				// 	rank -= 0.5;
				// }
				// rank+= 5 + (parseInt(data[i].rank[0])/16);
				// data[i].rank = rank;
				// data[i].uploader={
				// 	href : t('td.itu>div>a').attr('href'),
				// 	name : t('td.itu>div>a').text()
				// };
			});
			var end = this.html('p.ip').text().split('of');
			var notend = end[0].split('-')[1];
			data.end = notend == end[1] ? true:false;
			this.data = data;
			console.log(this.data)
			this.ret( req);
		}catch(e){
			console.log(e)
		};
	}, // Ö÷í“Ãæ½âÎö
	g : function( html, req, url){ // 取得詳細頁面
		this._p(html);
		var data = {},type = '',t;
		data.img = this.html.find('#gleft>#gd1>img').attr('src');
		data.name = this.html.find('#gd2>#gn').text();
		data.rank = this.html.find('#rating_label').text().replace('Average: ','')
		data.rank_times = this.html.find('#rating_count').text()
		data.type = this.html.find('#gdc>a>img').attr('alt');
		this.html.find('.gdtm a:first').each(function(i,e){
			data.start = $(this).attr('href');
		});
		data.information = {};
		this.html.find('#gdd tr').each(function( i, e){
			type = $(this).find('.gdt1').text().replace(':','').replace(' ','_').toLowerCase();
			if(type=='parent'){
				data.information[type] = {};
				data.information[type].text = $(this).find('.gdt2').text();
				data.information[type].href = $(this).find('.gdt2 a').attr('href');
			}
			else
			data.information[type] = $(this).find('.gdt2').text();
		});

		console.log(this.html.find('#favoritelink').text());

		//exhentai 有bug 無效
		//data.isfavorite = this.html.find('#favoritelink').text().indexOf('Add to Favorites')==-1? true: false;

		data.comment = {};
		/*取得用戶留言*/
		this.html.find('div.c1').each(function( i,e){
			data.comment[i] = {};
			t = $(this);
			data.comment[i].User = t.find('.c3>a').text();
			data.comment[i].log  = t.find('.c3').text(); 
			data.comment[i].isupl = t.find('.c4').text()=='Uploader Comment'?true:false;
			data.comment[i].msg   = t.find('.c6').html();
		});
		console.log(url);
		data.url = url.replace(global.Data.data.base);
		this.data = data;
		this.ret( req);
	},
	s : function( html, req){ // 取得圖片
		this._p(html);
		var data = {};
		data.image = this.html.find('#img').attr('src');
		data.fullimage = this.html.find('#i7.if>a').attr('href');
		//console.log(html);
		//console.log('img:'+data.fullimage);
		data.next = this.html.find('#next').attr('href');
		data.prev = this.html.find('#prev').attr('href');
		data.inf  = this.html.find('#i2 div:eq(2)').text().split(' :: ');
		this.html.find('.sn div span').each(function( i, e){
			if(i == 0)
				data.now = $(this).text();
			else
				data.total = $(this).text()
		});
		this.data = data;
		this.ret( req);
	}
};

exports.parseData = function ( type, data , req){
	var url='';
	var count = 0;
	for(var i in data){
		if(i!='_url_'){
			url += '&'+i+'='+data[i];
			count++;
		}
	}
	url = url.substr(1);
	if(count>0)
		url = '?' + url;
	if(data._url_){
		url = data._url_+url;
	}
	switch( type){
		case 'list':
			exports.load_url(url,function( html, res, e){
				praser.list( html, req);
			});
			;break;
		case 'detail':
			exports.load_url(url,function( html, res, e){
				praser.g( html, req, url);
			});
			;break;
		case 'image':
			exports.load_url(url,function( html, res, e){
				if(e){
				console.log(e);
				req( null , e);
				}else
				praser.s( html, req);
			})
			break;
	}
}

exports.parseImage = function( url, id, returnfuc){
	var opt = options;
	opt.url = url
	opt.responseType= 'arraybuffer'
	//opt.path = url.replace(global.Data.data.base,'');
	// var url = url.replace('http://','').replace('https://','');
	// opt.host = url.split('/')[0];
	// opt.path = url.replace(opt.host,'');
	// //console.log(options.host + url.replace(global.Data.data.base,''));
	// var data = [];	
	// //console.log(options.path);
	// //console.log('loading:'+options.path);
	// var request = http.request(opt , function( res){
	// 	  //console.log('STATUS: ' + res.statusCode);
	// 	  //console.log('HEADERS: ' + JSON.stringify(res.headers));
	// 	  //res.setEncoding('utf8');
	// 	  res.setEncoding('binary'); // this
	// 	  //´æÈ¡ÙYÁÏÖÐ
	// 	  res.on('data', function (chunk) {	
	// 		//data.push(chunk);
	// 	  	data.push(chunk);
	// 	  });
		  
	// 	  res.on('end', function (part) {
	// 	        /*var fs = require('fs');
	// 	        fs.writeFile('logo.jpeg', data, 'binary', function(err){
	// 	                    if (err) throw err
	// 	                    console.log('File saved.')
	// 	        });
	// 			*/
	// 	        
	// 	  });

	// 	  res.on('error',function(e){
	// 	  	global.Service.report( 'data_loader', e);
	// 	  });
	// });
	
	// request.on('error',function(e){
  //  		console.log("Error: \n" + e.message); 
  //  		console.log( e.stack );
	// });
	// request.end();
	console.log(url)
	returnfuc( url, id);
	// axios.request(opt).then((response) => {
	// 	console.log(response)
	// 	returnfuc( "data:" + response.headers["content-type"] + ";base64," +  new Buffer(response.data, 'binary').toString('base64'), id);
	// })
}
//'http://exhentai.org/t/79/c3/79c339dffe2597b61357810c26d74271fb3522f1-7755153-3000-4204-png_l.jpg'
/*
exports.parseImage('http://exhentai.org/t/79/c3/79c339dffe2597b61357810c26d74271fb3522f1-7755153-3000-4204-png_l.jpg',function(d){
	window.document.body.innerHTML='<img src="'+d+'">';
});
*/