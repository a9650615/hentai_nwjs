var exports = module.exports = {};

var http = require('http');
var request = require('request');

var data = {
	cookie : 'ipb_member_id=1886830; ipb_pass_hash=3810cc5bb92e67242ab932646b6d9c56; ipb_session_id=41fc9128524537bbc6d51216b43bea3a; igneous=01d33ef3fdeb06d9cdc324f6b73c73e94c3ccf4b85dccba0c4c3853fc76964d8d97cae4f4d62c021f72e422f49606c2519a43cdeb45e90b65f5110ca8859318c;',
	data   : JSON.stringify({ })
};

var options = {
     host: global.ProgramData.base.replace('http://',''),
     port: 80,
     path: '/',
     method: 'GET',
     headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
        'Cookie': data.cookie,
        'Accept': '/',
        'Connection': 'keep-alive'
    }
};

function update_usercookie(){
  global.Setting.UserCookie = localStorage.getItem('UserCookie')?localStorage.getItem('UserCookie'):global.Setting.UserCookie;
}

exports.change_cookie = () => {
	update_usercookie();
	if(global.Setting.UserCookie)
	data.cookie = global.Setting.UserCookie;
	options.headers.Cookie = data.cookie;
}

exports.load_url = function ( url, returnfuc){
	exports.change_cookie();
	var html = '';
	options.path = (url?'/'+url:null) || '/';
	//console.log(options.path);
	//console.log('loading:'+options.path);
	var request = http.request(options , function( res){
		  //console.log('STATUS: ' + res.statusCode);
		  //console.log('HEADERS: ' + JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  //´æÈ¡ÙYÁÏÖÐ
		  res.on('data', function (chunk) {	
		    html += chunk;
		  });
		  
		  res.on('end', function (part) {
		        returnfuc( html, res, null);
		  });

		  res.on('error',function(e){
		  	global.Service.report( 'data_loader', e);
		  });
	});
	
	request.on('error',function(e){
   		console.log("Error: \n" + e.message); 
   		console.log( e.stack );
   		//returnfuc( html, res, e);
   		exports.load_url( url, returnfuc);
	});
	request.end();
}

var $ = window.$;
var praser = {
	html: null,
	data: {},
	_p : function( html){
		this.data = {};
		try{
			this.html =  window.$(html);
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
			this.html.find('tr.gtr0,tr.gtr1').each(function(i,e){
				//console.log(e);
				rank = 0;
				t = $(this);
				data[i] = {};
				data[i].type= t.find('td.itdc>a>img').attr('alt');
				data[i].publish = t.find('td.itd:first').text();
				if(i==0)
				data[i].img = t.find('td.itd:eq(1)>div>div.it2>img').attr('src');
				else{
					data[i].img = t.find('td.itd:eq(1)>div>div.it2').text().split('~');
					data[i].img = 'http://'+data[i].img[1]+'/'+data[i].img[2];
				}
				data[i].name = t.find('td.itd:eq(1)>div>div.it5>a').text();
				data[i].href = t.find('td.itd:eq(1)>div>div.it5>a').attr('href');
				data[i].torrent = t.find('td.itd:eq(1)>div>div.it3>div>a').attr('href');
				data[i].rank = t.find('td.itd:eq(1)>div>div.it4>div.it4r').css('background-position');
				data[i].rank = data[i].rank.match(/[+\-]?\d*px/g);
				if(data[i].rank[1]=='-21px'){
					rank -= 0.5;
				};
				rank+=5+(parseInt(data[i].rank[0])/16);
				data[i].rank = rank;
				data[i].uploader={
					href : t.find('td.itu>div>a').attr('href'),
					name : t.find('td.itu>div>a').text()
				}; 
			});
			var end = this.html.find('p.ip').text().split('of');
			var notend = end[0].split('-')[1];
			data.end = notend == end[1] ? true:false;
			this.data = data;
			this.ret( req);
		}catch(e){

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
		//標籤列表
		data.tags = {};
		this.html.find('#taglist tr').each( ( i, e) => {
			let tags = $(e).find('td');
			tags.each( ( i, e) => {
				/*if(i == 0){
					data.tags[$(e).html()] = [];
				}*/
				if(i == 1){
					$(e).find('div').each( ( i, e) => {
						let cut = $(e).attr('id').replace('td_','').split(':');
						if(!data.tags[ cut[0] ]) data.tags[ cut[0] ] = [];
						data.tags[ cut[0] ].push(cut[1]);
					})
				}
			})
		})
		//圖片列表
		/*this.html.find('#gdt').children('.gdtm').each(function( i, e){ 
			let link = $(this).find('div a').attr('href');
			console.log(link)
		});*/

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
		data.url = url.replace(global.Data.base);
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
	//opt.path = url.replace(global.Data.data.base,'');
	opt.host = url.replace('http://','').split('/')[0];
	opt.path = url.replace('http://'+opt.host,'');
	//console.log(options.host + url.replace(global.Data.data.base,''));
	var data = [];	
	//console.log(options.path);
	//console.log('loading:'+options.path);
	var request = http.request(opt , function( res){
		  //console.log('STATUS: ' + res.statusCode);
		  //console.log('HEADERS: ' + JSON.stringify(res.headers));
		  //res.setEncoding('utf8');
		  res.setEncoding('binary'); // this
		  //´æÈ¡ÙYÁÏÖÐ
		  res.on('data', function (chunk) {	
			//data.push(chunk);
		  	data.push(chunk);
		  });
		  
		  res.on('end', function (part) {
		        /*var fs = require('fs');
		        fs.writeFile('logo.jpeg', data, 'binary', function(err){
		                    if (err) throw err
		                    console.log('File saved.')
		        });
				*/
		        returnfuc( "data:" + res.headers["content-type"] + ";base64," +  window.btoa(data.join('')), id);
		  });

		  res.on('error',function(e){
		  	global.Service.report( 'data_loader', e);
		  });
	});
	
	request.on('error',function(e){
   		console.log("Error: \n" + e.message); 
   		console.log( e.stack );
	});
	request.end();
	
}
//'http://exhentai.org/t/79/c3/79c339dffe2597b61357810c26d74271fb3522f1-7755153-3000-4204-png_l.jpg'
/*
exports.parseImage('http://exhentai.org/t/79/c3/79c339dffe2597b61357810c26d74271fb3522f1-7755153-3000-4204-png_l.jpg',function(d){
	window.document.body.innerHTML='<img src="'+d+'">';
});
*/