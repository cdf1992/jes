/**
 * 百望单机版接口
 */
Ext.define("Ext.ux.vms.BW.bw_disk", {
	alias : 'Ext.ux.vms.BW.bw_disk'
})
var taxInfoCheckOk = false;
var diskNo = "";
var MachineNo = "";
var returnFlag = false;
var x;

function onExec(type,xml){
		  if(type == null) return;
		  if(xml == null) return;
		  window.parent.frames['bw_disk'].onExec(type,xml);
		  return window.parent.retbwxml;
}

// 百望税控组件初始化
function init(ocxObj) {
	if (ocxObj == null) {
		alert("税控组件加载失败...0");
	} else {
		Ext.Ajax
				.request({
					url : 'createTaxInfo.ajax',
					async : false,
					dataType : "json",
					success : function(data) {
						var ajaxReturn = Ext.decode(data.responseText);
						if (ajaxReturn.isNormal) {
							try {
								var StringXml = onExec('hqskp',ajaxReturn.attributes.StringXml);
								Ext.Ajax.request({
											url : 'checkTaxInfo.ajax',
											async : false,
											dataType : "json",
											params : {
												StringXml : StringXml
											},
											success : function(data) {
												var ajaxReturn1 = Ext.decode(data.responseText);
												if (ajaxReturn1.isNormal) {
													diskNo = ajaxReturn1.attributes.diskNo;
													MachineNo = ajaxReturn1.attributes.MachineNo;
													Ext.Ajax.request({
																url : 'createRegistInfo.ajax',
																async : false,
																dataType : "json",
																params : {
																	diskNo : diskNo
																},
																success : function(
																		data) {
																	var ajaxReturn2 = Ext
																			.decode(data.responseText);
																	if (ajaxReturn2.isNormal) {
																		var StringXml = onExec('zcmdr',ajaxReturn2.attributes.StringXml);
																		Ext.Ajax.request({
																					url : 'checkRegistInfo.ajax',
																					dataType : "json",
																					async : false,
																					params : {
																						StringXml : StringXml
																					},
																					success : function(
																							data) {
																						var ajaxReturn3 = Ext
																								.decode(data.responseText);
																						if (ajaxReturn3.isNormal) {
																							this.taxInfoCheckOk = true;
																							returnFlag = true;
																						} else {
																							alert(ajaxReturn3.message);
																							returnFlag = false;
																						}
																					}
																				});
																	} else {
																		alert(ajaxReturn2.message);
																		returnFlag = false;
																	}
																}

															});
												} else {
													alert(ajaxReturn1.message);
													returnFlag = false;
												}

											}
										});
							} catch (e) {
								alert("税控组件加载失败...1");
								returnFlag = false;
							}
						} else {
							alert(ajaxReturn.message);
							this.returnFlag = false;
						}
					}
				});
	}
	return returnFlag;
}
function createSynchronousTaxDisk(store,ocxObj,diskNo, fapiaoType) {
	// 同步
	Ext.Ajax.request({
		url : 'createSynchronousTaxDisk.ajax',
		dataType : "json",
		params : {
			diskNo : diskNo,
			fapiaoType : fapiaoType
		},
		success : function(data) {
			var ajaxReturn = Ext.decode(data.responseText);
			if (ajaxReturn.isNormal) {
				try {
					var StringXml = onExec('drzcm',ajaxReturn.attributes.StringXml);
					Ext.Ajax.request({
						url : 'synchronousTaxDiskResult.ajax',
						dataType : "json",
						params : {
							StringXml : StringXml,
							diskNo : diskNo,
							fapiaoType : fapiaoType
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (ajaxReturn1.isNormal) {
								alert("同步成功");
								store.loadPage(1);
							} else {
								alert("同步失败" + ajaxReturn1.message);
								store.loadPage(1);
							}
						}
					});
				} catch (e) {
					this.messages = "税控组件加载失败...";
					alert(messages);
					store.loadPage(1);
					return false;
				}
			}else{
				alert(ajaxReturn.message);
				store.loadPage(1);
			}
		}
	});
}
function createCurBillNoInfo(ocxObj, grid) {

	if (grid.length > 0) {
		var fapiaoType = grid[0].get('fapiaoType');

		Ext.Ajax
				.request({
					url : 'queryBillInfo.ajax',
					dataType : "json",
					sync:true,
					params : {
						taxDiskNo : diskNo,
						fapiaoType : fapiaoType
					},
					success : function(data) {
						var ajaxReturn = Ext.decode(data.responseText);
						if (ajaxReturn.isNormal) {
							try {
								var StringXml = onExec('drzcm',ajaxReturn.attributes.StringXml);
							} catch (e) {
								this.messages = "税控组件加载失败...";
								alert(messages);
								return false;
							}
							Ext.Ajax
									.request({
										url : 'queryBillInfoResult.ajax',
										dataType : "json",
										sync:true,
										params : {
											StringXml : StringXml,
											fapiaoType : fapiaoType
										},
										success : function(data) {
											var ajaxReturn1 = Ext
											.decode(data.responseText);
											var billCode = ajaxReturn1.attributes.billCode;
											var billNo = ajaxReturn1.attributes.billNo
											if(ajaxReturn1.isNormal){
												Ext.Ajax.request({
													url : 'hscinvoicenumber.ajax',
													dataType : "json",
													sync:true,
													params : {
														billCode : billCode,
														billNo : billNo,
														fapiaotype : fapiaoType
													},
													success : function(data) {
														var ajaxReturn = Ext.decode(data.responseText);
														alert("当前代码"+billCode+"当前号码"+billNo);
														alert(ajaxReturn);
														return;
													}
												});
											}else{
												alert(ajaxReturn1.message);
												this.returnFlag = false;
											}
										}
									});
						} else {
							alert(ajaxReturn1.message);
							this.returnFlag = false;
							return;
						}
					}
				});
	} else {
		Ext.MessageBox.alert('提示', '请选择一笔需要开票的数据...');
		return;
	}
}
// 蓝票开具
function createBillissue(ocxObj, grid, gridStore,mk) {
	var ids = [];
	var billId;
	if (grid.length > 0) {
		for (var i = 0; i < grid.length; i++) {
			ids.push(grid[i].get('billId'));
		}
	} else {
		Ext.MessageBox.alert('提示', '请选择一笔需要开票的数据...');
		return;
	}
	var a_falg = 0;
	var flag = true;
	for (var i = 0; i < grid.length; i++) {
		billId = grid[i].get('billId');
		var fapiaoType = grid[i].get('fapiaoType');
		Ext.Ajax.request({
			url : 'createBillissueBWDisk.ajax',
			async : false,
			dataType : "json",
			params : {
				billId : billId,
				fapiaoType : fapiaoType,
				diskNo : diskNo,
				MachineNo : MachineNo
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					try {
						var StringXml = onExec('fpkj',ajaxReturn.attributes.StringXml);
						Ext.Ajax
								.request({
									url : 'updateBillIssueResult.ajax',
									async : false,
									dataType : "json",
									params : {
										diskNo : diskNo,
										MachineNo : MachineNo,
										billId : billId,
										StringXml : StringXml,
										fapiaoType : fapiaoType,
										ids : billId
									},
									success : function(data) {
										var ajaxReturn1 = Ext
												.decode(data.responseText);
										if (!ajaxReturn1.isNormal) {
											flag = false;
										} else {
											a_falg++;
										}
									}
								});
					} catch (e) {
						alert("税控组件加载失败...2");
						return false;
					}
				} else {
					alert(ajaxReturn.message);
					flag = false;
				}
			}
		});
		if (!flag) {
			unlockBillInfo(billId, '7');
			break;
		}
	}
	mk.hide();
	alert("开具" + ids.length + "条;开具成功" + a_falg + "条!");
	gridStore.reload();
}

// 发票作废
function createBillCancel(ocxObj, grid, gridStore) {
	if (grid.length == 0 || grid.length > 1) {
		Ext.MessageBox.alert('提示', '请选择一笔需要作废的数据...');
		return;
	}
	var flag = true;
	var billId;
	for (var i = 0; i < grid.length; i++) {
		billId = grid[i].get('billId');
		Ext.Ajax.request({
			url : 'createBillCancelForBW.ajax',
			dataType : "json",
			params : {
				diskNo : diskNo,
				billId : billId
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					var StringXml = onExec('fpzf',ajaxReturn.attributes.StringXml);
					// alert("StringXml:" + StringXml);
					Ext.Ajax.request({
						url : 'updateBillCancelResult.ajax',
						dataType : "json",
						params : {
							StringXml : StringXml,
							diskNo : diskNo,
							billId : billId
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (ajaxReturn1.isNormal) {
								alert("作废成功");
								gridStore.reload();
							} else {
								flag = false;
								alert(ajaxReturn1.message);
							}
						}
					});
				}
				if (!flag) {
					unlockBillInfo(billId, '14');
				}
			}
		});
	}

}

// 红票开具
function createRedBillissue(ocxObj, grid, gridStore) {
	var ids = [];
	if (grid.length > 0) {
		for (var i = 0; i < grid.length; i++) {
			ids.push(grid[i].get('billId'));
		}
	} else {
		Ext.MessageBox.alert('提示', '请选择一笔需要开票的数据...');
		return;
	}
	var a_falg = 0;
	var flag = true;
	for (var i = 0; i < grid.length; i++) {
		var billId = grid[i].get('billId');
		var fapiaoType = grid[i].get('fapiaoType');
		Ext.Ajax.request({
			url : 'createRedBillissueForBWDisk.ajax',
			async : false,
			dataType : "json",
			params : {
				billId : billId,
				fapiaoType : fapiaoType,
				diskNo : diskNo,
				MachineNo : MachineNo
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					try {
						var StringXml = onExec('fphc',ajaxReturn.attributes.StringXml);
					} catch (e) {
						this.messages = "税控组件加载失败...3";
						alert(messages);
						return false;
					}
					Ext.Ajax.request({
						url : 'updateRedBillIssueResult.ajax',
						async : false,
						dataType : "json",
						params : {
							billId : billId,
							diskNo : diskNo,
							MachineNo : MachineNo,
							StringXml : StringXml,
							fapiaoType : fapiaoType
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (!ajaxReturn1.isNormal) {
								alert(ajaxReturn1.message);
								flag = false;
							} else {
								a_falg++;
							}
						}
					});
				} else {
					alert(ajaxReturn.message);
					flag = false;
				}
			}
		});
		if (!flag) {
			unlockBillInfo(billId, '25');
			break;
		}
	}
	alert("开具" + ids.length + "条;开具成功" + a_falg + "条!");
	gridStore.reload();
}

// 打印
function createBillPrint(ocxObj, grid, gridStore) {
	var ids = [];
	if (grid.length > 0) {
		for (var i = 0; i < grid.length; i++) {
			ids.push(grid[i].get('billId'));
		}
	} else {
		Ext.MessageBox.alert('提示', '请选择一笔需要打印的数据...');
		return;
	}
	var flag = true;
	var billId = grid[0].get('billId');
	var fapiaoType = grid[0].get('fapiaoType');
	var billNoBegin = grid[0].get('billNo');
	var billNoEnd = grid[grid.length - 1].get('billNo');

	if (ids.length > 1) {
		Ext.Ajax.request({
			url : 'bwPrintBatch.ajax',
			async : false,
			dataType : "json",
			params : {
				diskNo : diskNo,
				billId : billId,
				fapiaoType : fapiaoType,
				billNoBegin : billNoBegin,
				billNoEnd : billNoEnd
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					var StringXml =  onExec('fpdy',ajaxReturn.attributes.StringXml);
					// alert("StringXmlPrint:" + StringXml);
					Ext.Ajax.request({
						url : 'bwPrintBatchReturn.ajax',
						async : false,
						dataType : "json",
						params : {
							diskNo : diskNo,
							billIds : ids,
							fapiaoType : fapiaoType,
							billNoBegin : billNoBegin,
							billNoEnd : billNoEnd,
							StringXml : StringXml
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (!ajaxReturn1.isNormal) {
								alert(ajaxReturn1.message);
								flag = false;
							} else {
								alert(ajaxReturn1.message);
								gridStore.reload();
							}

						}
					});
				} else {
					alert(ajaxReturn.message);
					flag = false;
				}

			}
		});
	} else {
		var billId = ids[0];
		Ext.Ajax.request({
			url : 'createBillPrintForBWDisk.ajax',
			dataType : "json",
			params : {
				diskNo : diskNo,
				billId : billId
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					var StringXml =  onExec('fpdy',ajaxReturn.attributes.StringXml);
					Ext.Ajax.request({
						url : 'updateBillPrintResult.ajax',
						dataType : "json",
						params : {
							billId : billId,
							StringXml : StringXml
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (!ajaxReturn1.isNormal) {
								alert(ajaxReturn1.message);
								flag = false;
							} else {
								alert("打印成功");
								gridStore.reload();
							}
						}
					});
				} else {
					alert(ajaxReturn.message);
					flag = false;
				}

			}
		});
		if (!flag) {
			unlockBillInfo(billId, '9')
		}
	}
}

//发票打印 添加发票快递数据
function createBillInvoicePrint(ocxObj, grid, gridStore) {
	var ids = [];
	if (grid.length > 0) {
		for (var i = 0; i < grid.length; i++) {
			ids.push(grid[i].get('billId'));
		}
	} else {
		Ext.MessageBox.alert('提示', '请选择一笔需要打印的数据...');
		return;
	}
	var flag = true;
	var billId = grid[0].get('billId');
	var fapiaoType = grid[0].get('fapiaoType');
	var billNoBegin = grid[0].get('billNo');
	var billNoEnd = grid[grid.length - 1].get('billNo');

	if (ids.length > 1) {
		Ext.Ajax.request({
			url : 'bwPrintBatch.ajax',
			async : false,
			dataType : "json",
			params : {
				diskNo : diskNo,
				billId : billId,
				fapiaoType : fapiaoType,
				billNoBegin : billNoBegin,
				billNoEnd : billNoEnd
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					var StringXml = onExec('fpdy',ajaxReturn.attributes.StringXml);
					// alert("StringXmlPrint:" + StringXml);
					Ext.Ajax.request({
						url : 'bwPrintInvoiceBatchReturn.ajax',
						async : false,
						dataType : "json",
						params : {
							diskNo : diskNo,
							billIds : ids,
							fapiaoType : fapiaoType,
							billNoBegin : billNoBegin,
							billNoEnd : billNoEnd,
							StringXml : StringXml
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (!ajaxReturn1.isNormal) {
								alert(ajaxReturn1.message);
								flag = false;
							} else {
								alert(ajaxReturn1.message);
								gridStore.reload();
							}

						}
					});
				} else {
					alert(ajaxReturn.message);
					flag = false;
				}

			}
		});
	} else {
		var billId = ids[0];
		Ext.Ajax.request({
			url : 'createBillPrintForBWDisk.ajax',
			dataType : "json",
			params : {
				diskNo : diskNo,
				billId : billId
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					var StringXml = onExec('fpdy',ajaxReturn.attributes.StringXml);
					Ext.Ajax.request({
						url : 'updateBillInvoicePrintResult.ajax',
						dataType : "json",
						params : {
							billId : billId,
							StringXml : StringXml
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (!ajaxReturn1.isNormal) {
								alert(ajaxReturn1.message);
								flag = false;
							} else {
								alert("打印成功");
								gridStore.reload();
							}
						}
					});
				} else {
					alert(ajaxReturn.message);
					flag = false;
				}

			}
		});
		if (!flag) {
			unlockBillInfo(billId, '9')
		}
	}
}

function createRedBillPrint(ocxObj, grid, gridStore) {
	var ids = [];
	if (grid.length > 0) {
		for (var i = 0; i < grid.length; i++) {
			ids.push(grid[i].get('billId'));
		}
	} else {
		Ext.MessageBox.alert('提示', '请选择一笔需要开票的数据...');
		return;
	}
	var flag = true;
	for (var i = 0; i < ids.length; i++) {
		var billId = ids[i];
		Ext.Ajax.request({
			url : 'createRedBillPrintForBWDisk.ajax',
			dataType : "json",
			params : {
				diskNo : diskNo,
				billId : billId
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				if (ajaxReturn.isNormal) {
					var StringXml = onExec('fpdy',ajaxReturn.attributes.StringXml);
					Ext.Ajax.request({
						url : 'updateRedBillPrintResult.ajax',
						dataType : "json",
						params : {
							billId : billId,
							StringXml : StringXml
						},
						success : function(data) {
							var ajaxReturn1 = Ext.decode(data.responseText);
							if (!ajaxReturn1.isNormal) {
								alert(ajaxReturn1.message);
								this.returnFlag = false;
								flag = false;
							} else {
								this.returnFlag = true;
							}
						}
					});
				} else {
					alert(ajaxReturn.message);
					this.returnFlag = false;
					flag = false;
				}
			}
		});
		if (!flag) {
			break;
		}

	}
	if (flag) {
		alert("打印成功!")
	}
}

// 发票异常锁定
function unlockBillInfo(billId, status) {
	Ext.Ajax.request({
		url : 'unlockBillInfo.ajax',
		dataType : "json",
		params : {
			billId : billId,
			status : status
		},
		success : function(data) {
			var ajaxReturn = Ext.decode(data.responseText);
			return ajaxReturn.isNormal;
		}
	});
}
//退回
function reportTaxDiskRetrieve(store,ocxObj,invoiceCode,invoiceType,beginNo,invoiceEndNo,taxDiskNo,taxBsphNo){
	Ext.Ajax.request({
		url : 'reportTaxDiskRetrieve.ajax',
		dataType : "json",
		params : {
			invoiceCode : invoiceCode,
			invoiceType : invoiceType,
			beginNo:beginNo,
			invoiceEndNo:invoiceEndNo,
			taxDiskNo:taxDiskNo,
			taxBsphNo:taxBsphNo
		},
		success : function(data) {
			var ajaxReturn = Ext.decode(data.responseText);
			if (ajaxReturn.isNormal) {
				try{
					var StringXml = onExec('drzcm',ajaxReturn.attributes.StringXml);
				}catch(e){
					this.messages = "税控组件加载失败...";
					alert(messages);
					return false;
				}
				Ext.Ajax.request({
					url : 'retrieveResultInfo.ajax',
					dataType : "json",
					params : {
						StringXml : StringXml,
						invoiceCode : invoiceCode,
						invoiceType:invoiceType,
						beginNo:beginNo,
						invoiceEndNo:invoiceEndNo,
						taxDiskNo:taxDiskNo,
						taxBsphNo:taxBsphNo
					},
					success : function(data) {
						var ajaxReturn = Ext.decode(data.responseText);
						if(ajaxReturn1.isNormal){
							alert("退回成功");
							store.loadPage(1);
						}else{
							alert("退回失败"+ajaxReturn1.message);
							store.loadPage(1);
						}
					}
				});
			}else{
				alert(ajaxReturn.message);
				store.loadPage(1);
			}
		}
	});
}
//发票异常锁定
function lockBillInfo(grid) {
	for (var i = 0; i < grid.length; i++) {
		billId = grid[i].get('billId');
		Ext.Ajax.request({
			url : 'unlockBillInfo.ajax',
			dataType : "json",
			params : {
				billId : billId,
				status : "L"
			},
			success : function(data) {
				var ajaxReturn = Ext.decode(data.responseText);
				return ajaxReturn.isNormal;
			}
		});
	}
}