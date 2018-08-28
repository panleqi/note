$(function(){
	phone = getUrlParam("phone"); //app传的参数
//	phone = 15992069246;
	var sp_val;  //储存答案
	var num = 0; //变量
	var iW = $('.subject').innerWidth();  //每个答题卡的宽
	
//	var iw_length = iW*$('.subject').length;  //总长度
//	$('.subject-width').css("width",iw_length);  //设置宽
	
	var arr = [1234,1234,1234,123,1,1,12,1,123,13];
	
	//点击答案：
	$('.bright').find("span").click(function(){
		$(this).toggleClass("active");
	})
	
	//点击下一题：
	$('.btn').click(function(){
		sp_val = '';
		var spans = $('.bright').eq(num).find("span");  //所有span
		var active = $('.bright').eq(num).find(".active");  //选中的答案
	
		//判断找到选中的答案
		for(var i=0;i<active.length;i++){
			if(active.eq(i).attr("class")){
				sp_val += active.eq(i).attr("value");
			} 
		}

		//判断答案没选中时
		if($('.bright').eq(num).find(".active").length == 0){
			tips_alert("请选择答案");
			return false;
		}
		
		//判断答案是否匹配
		if(sp_val == arr[num]){
			num++;
			if(num >= 10){
				num = 9;
				$.getJSON("https://192.168.0.101:8080/Delivery/user/answer.do?user_phone="+phone+"&jsoncallback=?", function(data){
				 	 if(data.CODE == 200 || data.CODE == 201){
				 	 	alert("恭喜答对了~");
				 	 	window.webkit.messageHandlers.answerAlert.postMessage('success');
				 	 }else{
				 	 	alert(data.MESSAGE);
				 	 	window.webkit.messageHandlers.answerAlert.postMessage('fail');
				 	 }
				});
			}else{
				$('.subject-width').css("left",-(num*iW)+'px');
			}
		}else{
			var str = String(arr[num]);     //数字转字符串
			var arr_answer = str.split('');    //字符串拆分为数组    答案
			
			for(var i=0;i<arr_answer.length;i++){
				$('.bright').eq(num).find("span[value="+arr_answer[i]+"]").addClass("flash");
				setTimeout(function(){
					spans.removeClass("flash");
				},1000)
			}
		}
		
		
	})
	
})
// 获取url中的参数
function getUrlParam(key) {
	// 获取参数
	var url = window.location.search;
	// 正则筛选地址栏
	var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
	// 匹配目标参数
	var result = url.substr(1).match(reg);
	// 返回参数值
	return result ? decodeURIComponent(result[2]) : null;
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
