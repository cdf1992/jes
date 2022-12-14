/**
 * 发票作废公用方法
 */
Ext.define("Ext.ux.vms.bill.billCancelInv", {
	alias : 'Ext.ux.vms.bill.billCancelInv'
})

/**
 * 
 * @param {} kpStatus 作废接口
 * @param {} grid 选中的开票数据
 * @param {} vmskpRelyon 是否支持多税控设备【1、否；2、是】
 */
var billIssureCancelInv = function(kpStatus,grid,store,vmskpRelyon,invoiceTaxControl) {
	if (grid.length > 0) {
		var ids = [];
		for (var i = 0; i < grid.length; i++) {
			ids.push(grid[i].get('billId'));
		}
	} else {
		Ext.MessageBox.alert('提示', '请选择一笔需要作废的数据...');
		return;
	}
	var reqUrl = "";
	if(vmskpRelyon == "2"){
		kpStatus = invoiceTaxControl;
	}
	switch(kpStatus){
		//1:百旺单机,2:百旺税控,3:北京航信,4:上海航信,5:内蒙航信
	 	case 1:
	 		break;
	 	case 2:
	 		break;
	 	case 3:
		 	reqUrl = 'createBillCancel.ajax';
	 		break;
	 	case 4:
		 	reqUrl = 'billCancelListASSH.ajax';
	 		break;
	 	case 5:
	 		reqUrl = 'billInvoiceNM.ajax';
	 		break;
	}
	Ext.Ajax.request({
		url : reqUrl,
		dataType : "json",
		params : {ids : ids},
		success : function(response) {
			if(kpStatus != 5){
				var result=Ext.decode(response.responseText);
				Ext.MessageBox.alert('提示',response.responseText);
				store.reload();
			}else{
				//内蒙前端作废接口调用
				var result=Ext.decode(response.responseText);
				var billInfoList = result.billInfoList;
				console.log("需要作废的数据返回成功,开始开启税控盘.");
				var succCount = 0;//记录开票成功总数
				OpenCard();//打开税盘
				if (is_open == 0) {
					alert("金税盘未打开！");
					return;
				}
				console.log("税控盘开启成功.");
				var reBillList = new Array();
				for (var i = 0; i < billInfoList.length; i++) {
					//获取票据对象并传入作废接口
					var reBill = CancelInvFun(billInfoList[i]);
					console.log(i + " : " + JSON.stringify(reBill));
					reBillList.push(reBill);
					//判断reCode的返回值
					if(reBill.reCode != "6011"){
						alert("因票据ID为" + reBill.billId + "的数据作废失败,作废终止.一共作废成功-" + i + "笔.");
						// 关闭
						CloseCard();
						break;
					}else{
						succCount = succCount + 1;
					}
				}
				console.log("税控盘作废票据信息返回完成,开始关闭税控盘.");
				CloseCard();
				console.log("税控盘关闭成功,进入作废后台请求.");
				//更改发票作废状态
				Ext.Ajax.request({
					url:'updateBillCancelInvNM.ajax',
					dataType : "json",
					params : {reBillCancelInvList : JSON.stringify(reBillList)},
					success:function(data){
						var result=Ext.decode(data.responseText);
						//Ext.MessageBox.alert('提示',data.responseText);
						alert("作废成功,一共作废-" + succCount + "笔." );
						store.reload();
					}
				});
			}
			
		}
	});
};