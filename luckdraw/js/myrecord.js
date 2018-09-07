$(function(){
	var token;
	token = "d995459a8e496ac64964d35eede3fff9";
	var activity_id = 1;
	//var type = 1;
	var typebtn;  //领取奖品
	var classbtn;  //给两区按钮添加class
	var status; //是否领取奖品
	var page_num;
	page_num = 1;
	//抽奖记录ajax：
//	myrecord_fct();

	//点击抽奖记录：
	$('.whole-btn').click(function(){
		myrecord_fct();
		$('.myrecord').show();
		$('.myprize').hide();
	})
	
	//选项卡切换：
	$('.head-tab span').click(function(){
		$(this).addClass("active").siblings().removeClass();
	})
	
	//弹窗取消：
	$('.cancel-btn').click(function(){
		$('.show-window').hide();
	})
	 
	//点击我的奖品：
	$('.myprize-btn').click(function(){
		myprize_fct();
	})
	
	//抽奖记录ajax：
	function myrecord_fct(){ 
		$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getRaffleHistoryList.do?jsoncallback=?", {"token":token,"activity_id":activity_id,"type":1,"page":1},
			function(data){
		 	 if(data.STATUS == "true"){
		 	 	$('.myrecord-content').html('');
	//	 	 	console.log(data);
		 	 	$(data.DATA).each(function(i,ele){
		 	 		var html = '<p class="myrecord-data">'+
									'<span>'+ele.username+'</span>'+
									'<span>'+ele.raffle_time+'</span>'+
									'<span>'+ele.name+'</span>'+
								'</p>'
		 	 		$('.myrecord-content').append(html);
		 	 	})
		 	 }else{
		 	 	alert(data.MESSAGE);
		 	 }
		},'json');
	}
	
	//我的奖品：
	function myprize_fct(){
		$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getRaffleHistoryList.do?jsoncallback=?", {"token":token,"activity_id":activity_id,"type":3,"page":1},
			function(data){
		 	 if(data.STATUS == "true"){
		 	 	console.log(data);
		 	 	$('.myprize').html('');
		 	 	$('.myrecord').hide();
				$('.myprize').show();
		 	 	
		 	 	$(data.DATA).each(function(i,ele){
		 	 		if(ele.status == 1){
		 	 			status = "(已领取)";
		 	 			classbtn = "";
		 	 		}else{
		 	 			status = "(点击领取)";
			 	 		if(ele.type == 1){
			 	 			classbtn = "voucher";
			 	 		}else if(ele.type == 2){
			 	 			classbtn = "didiprize";
			 	 		}if(ele.type == 3){
			 	 			classbtn = "receive";
			 	 		}if(ele.type == 4){
			 	 			classbtn = "";
			 	 		}
		 	 		}
		 	 		var html = '<div class="myprize-data">'+
									'<p class="myprize-one">'+
										'<span>昵称</span>'+
										'<span>'+ele.username+'</span>'+
									'</p>'+
									'<p class="myprize-two">'+
										'<span>奖品</span>'+
										'<span class="'+classbtn+'" data-id = "'+ele.id+'">'+ele.name+' '+status+'</span>'+
									'</p>'+
									'<p class="myprize-three">'+
										'<span>抽奖时间</span>'+
										'<span>'+ele.raffle_time+'</span>'+
									'</p>'+
								'</div>'	
		 	 		$('.myprize').append(html);
		 	 	})
		 	 	//点击中了实体奖品的
		 	 	$('.receive').off("click").on("click",function(){
		 	 		
		 	 	})
		 	 	//中了优惠券的：
		 	 	$('.voucher').off("click").on("click",function(){
		 	 		address_id = 0;
		 	 		tips_alert("优惠券自领取之日起十天有效",$(this).attr("data-id"),address_id);
		 	 	})
		 	 	//中了递递的：
		 	 	$('.didiprize').off("click").on("click",function(){
		 	 		address_id = 0;
		 	 		tips_alert("确认领取之后将直接放进我的递递里~",$(this).attr("data-id"),address_id);
		 	 	})
		 	 }else{
		 	 	alert(data.MESSAGE);
		 	 }
		},'json');
	}
	//提示弹窗：
	function tips_alert(data,id,address_id){
		$('.show-window').show();
		$('.show-content').html('');
		$('.show-content').html(data);
		$('.confirm-btn').off("click").on("click",function(){
			$('.show-window').hide();
			//领取奖励：
			$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getPrize.do?jsoncallback=?", {"token":token,"id":id,"address_id":address_id},
			function(data){
				console.log(data);
			 	 if(data.STATUS == "true"){
			 	 	tips_fct("领取成功");
			 	 	myprize_fct();
			 	 }else{
			 	 	alert(data.MESSAGE);
			 	 }
			},'json');
		})
	}
	//上拉刷新和下拉加载：
	var counter = 0;
    // 每页展示4个
    var num = 4;
    var pageStart = 0,pageEnd = 0;

    // dropload
    $('.content').dropload({
        scrollArea : window,
        domUp : {
            domClass   : 'dropload-up',
            domRefresh : '<div class="dropload-refresh">↓ 下拉刷新</div>',
            domUpdate  : '<div class="dropload-update">↑ 释放更新...</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
        },
        domDown : {
            domClass   : 'dropload-down',
            domRefresh : '<div class="dropload-refresh">↑ 上拉加载更多</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
            domNoData  : '<div class="dropload-noData">暂无数据~</div>'
        },
        loadUpFn : function(me){
        	console.log(1);me.resetload();
//      	$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getRaffleHistoryList.do?jsoncallback=?", {"token":token,"activity_id":activity_id,"type":1,"page":page_num},
//				function(data){
//					console.log(data);
//			 	 if(data.STATUS == "true"){
//		//	 	 	console.log(data);
//			 	 	$(data.DATA).each(function(i,ele){
//			 	 		var html = '<p class="myrecord-data">'+
//										'<span>'+ele.username+'</span>'+
//										'<span>'+ele.raffle_time+'</span>'+
//										'<span>'+ele.name+'</span>'+
//									'</p>'
//			 	 		
//			 	 	})
//			 	 	
//			 	 	// 为了测试，延迟1秒加载
//                  setTimeout(function(){
//                      $('.myrecord-content').append(html);
//                      // 每次数据加载完，必须重置
//                      me.resetload();
//                      // 重置索引值，重新拼接more.json数据
//                      counter = 0;
//                      // 解锁
//                      me.unlock();
//                      me.noData(false);
//                  },1000);
//			 	 }else{
//			 	 	alert(data.MESSAGE);
//			 	 	me.resetload();
//			 	 }
//			},'json');
		
        },
        loadDownFn : function(me){
        	console.log(page_num);
        	$.getJSON("http://192.168.0.99:8080/Mall/storeapp/getRaffleHistoryList.do?jsoncallback=?", {"token":token,"activity_id":activity_id,"type":1,"page":1},
				function(data){
					console.log(data);
			 	 if(data.STATUS == "true"){
					var html;
			 	 	$(data.DATA).each(function(i,ele){
			 	 		html = '<p class="myrecord-data">'+
										'<span>'+ele.username+'</span>'+
										'<span>'+ele.raffle_time+'</span>'+
										'<span>'+ele.name+'</span>'+
									'</p>';
						 $('.myrecord-content').append(html);	

			 	 		if(page_num >= data.pageCount){
			 	 			page_num = 0;
//                          // 锁定
                            me.lock();
                            // 无数据
                            me.noData();
                            return false;
                        }
			 	 	})
			 	 	page_num++;
			 	 	 // 为了测试，延迟1秒加载
//                  setTimeout(function(){
                        // 每次数据加载完，必须重置
                        me.resetload();
//                  },1000);
			 	 	
			 	 }else{
			 	 	alert(data.MESSAGE);
			 	 	// 即使加载出错，也得重置
                    me.resetload();
			 	 }
			},'json');
		
//          $.ajax({
//              type: 'GET',
//              url: 'json/more.json',
//              dataType: 'json',
//              success: function(data){
//                  var result = '';
//                  counter++;
//                  pageEnd = num * counter;
//                  pageStart = pageEnd - num;
//
//                  for(var i = pageStart; i < pageEnd; i++){
//                      result +=   '<a class="item opacity" href="'+data.lists[i].link+'">'
//                                      +'<img src="'+data.lists[i].pic+'" alt="">'
//                                      +'<h3>'+data.lists[i].title+'</h3>'
//                                      +'<span class="date">'+data.lists[i].date+'</span>'
//                                  +'</a>';
//                      if((i + 1) >= data.lists.length){
//                          // 锁定
//                          me.lock();
//                          // 无数据
//                          me.noData();
//                          break;
//                      }
//                  }
//                  // 为了测试，延迟1秒加载
//                  setTimeout(function(){
//                      $('.lists').append(result);
//                      // 每次数据加载完，必须重置
//                      me.resetload();
//                  },1000);
//              },
//              error: function(xhr, type){
//                  alert('Ajax error!');
//                  // 即使加载出错，也得重置
//                  me.resetload();
//              }
//          });
        },
        threshold : 50
    });
})
//小提示：
function tips_fct(data){
	$('.tips').html(data);
	$('.tips').fadeToggle();
	setTimeout(function(){
		$('.tips').fadeToggle("slow",function(){
			$('.tips').html('');
		});
	},3000)
}
