$(function(){
	var off = true; //开关
	var time;  //定时器
	var num = -1; //变量
	var speed = 40; //定时器速度
	var fastcircle = 4; //快速旋转的圈数
	var slowcircle = 1; //慢速旋转的圈数
	var fastindex = 0;  //记录快速匹配圈数
	var slowindex = 0;  //记录慢速匹配圈数
	var index = 0;   //记录圈数
	var result;  //后台返回的中奖id
	var type; //判断是否中奖
	var data_data;  //全局，传data
	var num_turn = 0; //变量
	var result_turn; //随机小数
	
	var token = "d995459a8e496ac64964d35eede3fff9";
	var activity_id = 1;
	
	//点击关闭弹窗：
	$('.off-result').click(function(){
		$('.bg-black').hide();
	})
	
	//我的记录按钮：
	$('.openinst').click(function(){
		location.href = "myrecord.html";
	})
	
	//获取我的递递：
	delivery_fct();
	
	//获取抽奖图片:
	$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getPrizeList.do?jsoncallback=?", {"token":token,"activity_id":activity_id},
		function(data){
	 	 if(data.STATUS == "true"){
//	 	 	console.log(data);
			$('.game-loop').html('');
	 	 	for(var i=0;i<=23;i++){
	 	 		var html = '<div data-zoonid="'+data.DATA[i%8].id+'" class="game-loop-item"><img src="'+data.DATA[i%8].url+'" /></div>'
	 	 		$('.game-loop').append(html);
	 	 	}
	 	 	$('.game-loop-item').eq(0).addClass("active");
			
	 	 }else{
	 	 	alert(data.MESSAGE);
	 	 }
	},'json');
	
	//获取列表信息：
	$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getRaffleHistoryList.do?jsoncallback=?", {"token":token,"activity_id":activity_id,"type":2},
		function(data){
	 	 if(data.STATUS == "true"){
//	 	 	console.log(data);
	 	 	$(data.DATA).each(function(i,ele){
	 	 		var html = '<li><span>'+ele.username+'</span>中了<span>'+ele.name+'</span></li>'
	 	 		$('.list').append(html);
	 	 	})
	 	 	list_fct();
	 	 }else{
	 	 	alert(data.MESSAGE);
	 	 }
	},'json');
	
	
	//点击抽奖
	$(".luck-draw").click(function(){
		if(off){
			result_turn = Math.ceil(Math.random()*6+7); //随机数
			console.log(result_turn);
			
			$.getJSON("http://192.168.0.99:8080/Mall/storeapp/raffle.do?jsoncallback=?", {"token":token,"activity_id":activity_id},function(data){
			 	 if(data.STATUS == "true"){
			 	 	delivery_fct();  //获取我的递递
			 	 	console.log(data);
			 	 	data_data = data;
			 	 	
					off = false;
					result = data.DATA.id;
		
					time = setInterval(function(){
						rotate_fct(); //旋转
						//记录圈数
						if(num == index){
							fastindex++;
						}
						if(fastindex == fastcircle){
							clearInterval(time);
							
							setTimeout(slow_fct,speed); //慢速旋转函数
						}
					},speed);
					
			 	 	
			 	 }else{
			 	 	alert(data.MESSAGE);
			 	 }
			},'json');
		}
	})
	
	//旋转函数
	function rotate_fct(){
		num++;
		if(num >= $('.game-loop-item').length){
			num = 0;
		}
		$('.game-loop-item').removeClass("active");
		$('.game-loop-item').eq(num).addClass("active");
	}
	//慢速旋转
	function slow_fct(){
		rotate_fct();
		speed += 5;
		if(num == index){
			slowindex++
		}
		if(slowindex >= slowcircle){
			num_turn++;
			if(num_turn >= result_turn){
				var data_zoonid = $('.game-loop-item').eq(num).attr("data-zoonid");
			
				if(data_zoonid == result){
					$('.bg-black').show();
					$('.result-zoo-exp').html(data_data.DATA.name);
					$('.result-zoo-icon').find('img').attr("src",data_data.DATA.url);
					if(data_data.DATA.type == 1){
						$('.result-ind').html("请到我的记录—我的奖品中领取");
					}else if(data_data.DATA.type == 2){
						$('.result-ind').html("请到我的记录—我的奖品中领取");
					}else if(data_data.DATA.type == 3){
						$('.result-ind').html("请到我的记录—我的奖品中领取");
					}else if(data_data.DATA.type == 4){
						$('.result-ind').html("很遗憾，未能抽中~");
					}
					num_turn = 0;
					index = num;
					fastindex = 0;
					slowindex = 0;
					speed = 40;
					off = true;
					return false;
				}
			}
			
		}
		setTimeout(slow_fct,speed); //慢速旋转函数
	}
	//获取我的递递：
	function delivery_fct(){
		$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getUserBalance.do?jsoncallback=?", {"token":token},
		function(data){
		 	 if(data.STATUS == "true"){
		 	 	$('.delivery-number').html(data.DATA);
		 	 }else{
		 	 	alert(data.MESSAGE);
		 	 }
		},'json');
	}
	
})
//列表轮播：
function list_fct(){
	var lis = $('.list').find('li').eq(0).height(); //一个列表的高
	var lis_length = $('.list').find('li').length-1;  //多少条数据
	lis_num = lis; 

	setInterval(function(){
		if(parseInt($('.list').css("margin-top")) <= -(lis*lis_length)){
			$('.list').css("margin-top",0);
			lis_num = 0;
		}else{
			$('.list').css("margin-top",-lis_num+'px');
			lis_num += lis;
		}
	},4000);
}
//提示弹窗：
function tips_alert(data,fn){
	$('.show-window').show();
	$('.show-content').html('');
	$('.show-content').html(data);
	$('.show-btn').off("click").on("click",function(){
		$('.show-window').hide();
		if(fn){
			location.href = fn;
		}
	})
}