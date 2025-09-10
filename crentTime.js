function displayCurrentTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth()+1;
  var day = now.getDate();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();

  // ゼロパディング
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  //var currentDate = year + '年' + month + '月' + day+ '日'; 
  var currentDate = year + '年' + month + '月' + day+ '日'; 
  var currentTime = hours + ':' + minutes;

  // HTML要素に現在時刻を設定
  document.getElementById('currentDate').innerText = currentDate;
  document.getElementById('nowTime').innerText = currentTime;
}

// 関数を1秒ごとに呼び出す
setInterval(displayCurrentTime, 1000);

// 初回実行
displayCurrentTime();




