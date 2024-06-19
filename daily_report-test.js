(function() {
    "use strict";

    kintone.events.on(["app.record.create.submit.success", "app.record.edit.submit.success"], async function(event) {
        // Check if the status is "下書き保存（投稿されません）"
        var status = event.record.チャットワーク投稿.value;
        if (status === "下書き保存（投稿されません）") { 
            return false; 
        }

        // Initial setup
        var subdomain = "yy218djhv8g9";
        var cw_token = 'f006decf55e10088bc354cd8f1e3e4e4'; //Lwin Koko test
        var room_id = '359031094';
        // var cw_token = '0e9084097d02ae51dacf58ac9a9e0e85'; 
        //var room_id = '85358642'; //general chat group
        var self_unread = 1;
    
        // Construct the report message
        var report = "";
        var user_selection = event.record.user_selection.value;
        var user_code = user_selection.map(user => user.code);
        
        if(user_code.length > 0){
          var userBody = {
          'codes': user_code,
          };
          var selected_users = await kintone.api(kintone.api.url('/v1/users.json', true), 'GET', userBody);
          selected_users.users.map((user) => {
            report += `${user.employeeNumber} \n`
          });  
        }
        
        
        report += "[info][title]【業務日報　" + event.record.日付.value + "　" + event.record.作成者.value.name + "】[/title]";
        for (var i = 0; i < event.record.業務内容.value.length; i++) {
            report += "■" + event.record.業務内容.value[i].value.業務種別.value;
            report += "　" + event.record.業務内容.value[i].value.稼働時間.value + "h";
            report += "\n" + event.record.業務内容.value[i].value.業務の詳細.value;
            if (i < event.record.業務内容.value.length - 1) { 
                report += "[hr]"; 
            }
        }
        report += "[/info]" + event.record.報告.value;
        
            // Construct the body of the message
        var user = kintone.getLoginUser();
        var body = user["name"] + "さんが日報を登録しました:)\n" + report + "\nhttps://" + subdomain + ".cybozu.com/k/" + event.appId + "/show#record=" + event.recordId;


        // URL and headers for the Chatwork API
        var url = 'https://api.chatwork.com/v2/rooms/' + room_id + '/messages';
        var headers = {
            'X-ChatWorkToken': cw_token,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Parameters for the POST request
        var params = 'body=' + encodeURIComponent(body) + "&self_unread=" + self_unread;

        // Send the message using kintone.proxy
        return kintone.proxy(url, 'POST', headers, params).then(function(args) {
            // Success
            console.log('Success:', args[1], JSON.parse(args[0]), args[2]);
        }, function(error) {
            // Error
            console.log('Error:', error);
        });
    });

        
})();