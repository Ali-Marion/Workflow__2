window.onload = function(e) {
	var div = document.querySelectorAll('.div');
	function addClass() {
		this.classList.toggle('div_active');
	}
	setInterval(function(){
		var rand = random(0,div.length-1);
		addClass.call(div[rand]);
	}, 1000);
};
function random(min,max) {
	return Math.floor(Math.random() * (max - min + 1));
}