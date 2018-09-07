var zoonData = {
	13: {
		"animal_id": 13,
		"name": "小兔子",
		"src": "img/game_icon_rabbit.png"
	},
	14: {
		"animal_id": 14,
		"name": "猫头鹰",
		"src": "img/game_icon_owl.png"
	},
	15: {
		"animal_id": 15,
		"name": "小黄狗",
		"src": "img/game_icon_dog.png"
	},
	16: {
		"animal_id": 16,
		"name": "小企鹅",
		"src": "img/game_icon_penguin.png"
	},
	17: {
		"animal_id": 17,
		"name": "小仓鼠",
		"src": "img/game_icon_hamster.png"
	},
	18: {
		"animal_id": 18,
		"name": "小猫咪",
		"src": "img/game_icon_cat.png"
	},
	19: {
		"animal_id": 19,
		"name": "小刺猬",
		"src": "img/game_icon_hedgehog.png"
	},
	20: {
		"animal_id": 20,
		"name": "小黄鸡",
		"src": "img/game_icon_chick.png"
	}
}

function getGameInfo(token, client_platform) { //获取游戏信息
	var deferred = $.Deferred();
	$.ajax({
		type: "post",
		url: httpd + "api.php/game/animalGameInfo",
		data: {
			"token": token,
			"client_platform": client_platform
		},
		success: function(data) {
			if(data.ret == 1) {
				deferred.resolve(data.data);
			}
		},
		error: function(res) {}
	});
	return deferred.promise();
}

function gameBet(anchor_id, bet_amt, animal_id, token, client_platform) { //游戏下注
	var deferred = $.Deferred();
	$.ajax({
		type: "post",
		url: httpd + "api.php/game/animalGameBet",
		data: {
			"anchor_id": anchor_id,
			"bet_amt": bet_amt,
			"animal_id": animal_id,
			"token": token,
			"client_platform": client_platform
		},
		success: function(data) {
			deferred.resolve(data);
		},
		error: function(res) {}
	});
	return deferred.promise();
}

function getGameBetHistory(token, client_platform) { //获取竞猜记录
	var deferred = $.Deferred();
	$.ajax({
		type: "post",
		url: httpd + "api.php/game/animalGameBetHistory",
		data: {
			"token": token,
			"client_platform": client_platform
		},
		success: function(data) {
			if(data.ret == 1) {
				deferred.resolve(data.data);
			}
		},
		error: function(res) {}
	});
	return deferred.promise();

}